package vehicle

import (
	"backend/mqtt"
	"backend/persistence"
	"encoding/json"
	"fmt"
	"github.com/twpayne/go-polyline"
	"os"
	"path/filepath"
	"time"
)

type latLng struct {
	Lat float64
	Lng float64
}

type waypoint struct {
	latLng
	dist       float64
	dur        float64
	stop       bool
	departure  timeString
	stationKey string
}

type Vehicle struct {
	Path        string
	Key         string
	position    latLng
	taskIndex   int
	tasks       []persistence.Task
	currentTask []waypoint
}

func NewVehicle(path string, key string) (*Vehicle, error) {
	vehicleFile, err := os.Open(filepath.Join(path, "vehicles", key+".json"))
	if err != nil {
		return nil, err
	}
	defer func() { _ = vehicleFile.Close() }()
	var persisted persistence.Vehicle
	err = json.NewDecoder(vehicleFile).Decode(&persisted)
	if err != nil {
		return nil, fmt.Errorf("could not decode json: %v", err)
	}
	if persisted.Tasks == nil || len(persisted.Tasks) == 0 {
		return nil, fmt.Errorf("cannot open vehicle without any tasks")
	}
	position, _, err := polyline.DecodeCoord([]byte(persisted.Position))
	if err != nil {
		return nil, fmt.Errorf("could not decode poly coord of position: %v", position)
	}
	result := Vehicle{
		Path:      path,
		Key:       key,
		position:  latLng{Lat: position[0], Lng: position[1]},
		taskIndex: 0,
		tasks:     persisted.Tasks,
	}
	result.loadNextTask()
	return &result, nil
}

func (v *Vehicle) loadNextTask() error {
	if len(v.tasks) == 0 {
		return fmt.Errorf("no more tasks available")
	}
	if v.tasks[0].Type == "roaming" {
		path, _, _ := polyline.DecodeCoords([]byte(v.tasks[0].Path.Geometry))
		waypoints := make([]waypoint, 0, len(path))
		for index, wp := range path {
			waypoints = append(waypoints, waypoint{
				latLng:    latLng{Lat: wp[0], Lng: wp[1]},
				dist:      v.tasks[0].Path.Meta[index].Dist,
				dur:       v.tasks[0].Path.Meta[index].Dur,
				stop:      false,
				departure: "0:00",
			})
		}
		v.currentTask = waypoints
		return nil
	}
	timetablePath := filepath.Join(v.Path, "timetables", *v.tasks[0].TimetableKey+".json")
	timetableFile, err := os.Open(timetablePath)
	if err != nil {
		return fmt.Errorf("could not load timetable file \"%s\": %v", timetablePath, err)
	}
	defer func() { _ = timetableFile.Close() }()
	var timetable persistence.Timetable
	err = json.NewDecoder(timetableFile).Decode(&timetable)
	if err != nil {
		return fmt.Errorf("could not read timetable file \"%s\": %v", timetablePath, err)
	}
	linePath := filepath.Join(v.Path, "lines", timetable.Line+".json")
	lineFile, err := os.Open(linePath)
	if err != nil {
		return fmt.Errorf("could not load line file \"%s\": %v", linePath, err)
	}
	defer func() { _ = lineFile.Close() }()
	var line persistence.Line
	err = json.NewDecoder(lineFile).Decode(&line)
	if err != nil {
		return fmt.Errorf("could not read line file \"%s\": %v", linePath, err)
	}
	path, _, _ := polyline.DecodeCoords([]byte(line.Path.Geometry))
	waypoints := make([]waypoint, 0, len(path))
	stopIndex := 0
	tour := findNextTourAfter(timetable.Tours, timeString(v.tasks[0].Start))
	for index, point := range path {
		wp := waypoint{
			latLng:    latLng{Lat: point[0], Lng: point[1]},
			dist:      line.Path.Meta[index].Dist,
			dur:       line.Path.Meta[index].Dur,
			stop:      line.Path.Meta[index].Stop,
			departure: "0:00",
		}
		if wp.stop && stopIndex < len(tour) {
			wp.departure = tour[stopIndex]
			stopIndex = stopIndex + 1
		}
		if wp.stop {
			wp.stationKey = timetable.Stations[stopIndex]
		}
		waypoints = append(waypoints, wp)
	}
	v.currentTask = waypoints
	v.tasks = v.tasks[1:len(v.tasks)]
	return nil
}

type SimulationOptions struct {
	TimeResolution int
	Sender         mqtt.Sender
	StartTime      timeString
	Speed          int
}

func (v *Vehicle) Simulate(options SimulationOptions) {
	for len(v.tasks) > 0 {
		distance := 0.0
		err := v.loadNextTask()
		if err != nil {
			return
		}
		position := v.currentTask[0].latLng
		for position.Lng != v.currentTask[len(v.currentTask)-1].Lng && position.Lat != v.currentTask[len(v.currentTask)-1].Lat {
			then := time.Now().UnixMilli()
			time.Sleep(time.Duration(1000/options.TimeResolution) * time.Millisecond)
			delta := float64((time.Now().UnixMilli() - then) / 1000)
			distance = distance + delta*float64(options.Speed)
			position = findPosition(distance, v.currentTask)
			options.Sender(mqtt.Message{
				Topic:   "position",
				Payload: [2]float64{position.Lat, position.Lng},
				Retain:  true,
			})
		}
	}
}

func findPosition(distance float64, waypoints []waypoint) latLng {
	if distance == 0 {
		return waypoints[0].latLng
	}
	sum := 0.0
	index := 0
	for sum < distance && index < len(waypoints) {
		sum = sum + waypoints[index].dist
		index = index + 1
	}
	if index == len(waypoints) {
		return waypoints[index-1].latLng
	}
	remaining := distance - (sum - waypoints[index-1].dist)
	p1x, p1y := waypoints[index-1].Lng, waypoints[index-1].Lat
	p2x, p2y := waypoints[index].Lng, waypoints[index].Lat
	directionX, directionY := p2x-p1x, p2y-p1y
	lambda := remaining / waypoints[index-1].dist
	return latLng{Lng: p1x + lambda*directionX, Lat: p1y + lambda*directionY}
}
