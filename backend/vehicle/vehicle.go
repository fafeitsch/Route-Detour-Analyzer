package vehicle

import (
	"backend/persistence"
	"encoding/json"
	"fmt"
	"github.com/twpayne/go-polyline"
	"os"
	"path/filepath"
)

type latLng struct {
	lat float64
	lng float64
}

type waypoint struct {
	latLng
	dist  float64
	dur   float64
	stop  bool
	start string
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
		position:  latLng{lat: position[0], lng: position[1]},
		taskIndex: 0,
		tasks:     persisted.Tasks,
	}
	return &result, nil
}

func (v *Vehicle) loadNextTask() error {
	if len(v.tasks) == 0 {
		return fmt.Errorf("no more tasks available")
	}
	if v.tasks[0].Type == "roaming" {
		path, _, err := polyline.DecodeCoords([]byte(v.tasks[0].Path.Geometry))
		if err != nil {
			return fmt.Errorf("cannot decode roaming currentTask")
		}
		waypoints := make([]waypoint, 0, len(path))
		for index, wp := range path {
			waypoints = append(waypoints, waypoint{
				latLng: latLng{lat: wp[0], lng: wp[1]},
				dist:   v.tasks[0].Path.Meta[index].Dist,
				dur:    v.tasks[0].Path.Meta[index].Dur,
				stop:   false,
				start:  "0:00",
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
	path, _, err := polyline.DecodeCoords([]byte(line.Path.Geometry))
	if err != nil {
		return fmt.Errorf("could not decode path of line \"%s\": %v", line.Key, err)
	}
	waypoints := make([]waypoint, 0, len(path))
	stopIndex := 0
	for index, point := range path {
		wp := waypoint{
			latLng: latLng{lat: point[0], lng: point[1]},
			dist:   line.Path.Meta[index].Dist,
			dur:    line.Path.Meta[index].Dur,
			stop:   line.Path.Meta[index].Stop,
			start:  "0:00",
		}
		if wp.stop {
			timetable.Tours[0].
		}
	}
	return nil
}
