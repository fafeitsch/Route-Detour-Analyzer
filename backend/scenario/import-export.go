package scenario

import (
	"backend/persistence"
	"encoding/json"
	"errors"
	"fmt"
	polyline2 "github.com/twpayne/go-polyline"
	"os"
	"sort"
	"sync"
)

func LoadFile(path string) (*Manager, error) {
	var scenario persistence.Scenario
	file, err := os.Open(path)
	if errors.Is(err, os.ErrNotExist) {
		scenario = persistence.Scenario{}
	} else if err != nil {
		return nil, fmt.Errorf("could not open file \"%s\": %v", path, err)
	} else {
		err = json.NewDecoder(file).Decode(&scenario)
		if err != nil {
			return nil, fmt.Errorf("could not parse json file: %v", err)
		}
	}
	defer func() { _ = file.Close() }()
	lines := make(map[string]Line)
	stations := make(map[string]Station)
	manager := Manager{
		lines:    lines,
		stations: stations,
		mutex:    sync.RWMutex{},
		filePath: path,
		Center: Center{
			Lat:  scenario.Center.Lat,
			Lng:  scenario.Center.Lng,
			Zoom: scenario.Center.Zoom,
		},
	}
	timetables := convertTimetablesFromPersistence(&manager, scenario.Timetables)
	manager.timetables = timetables
	vehicles, err := convertVehiclesFromPersistence(&manager, scenario.Vehicles)
	if err != nil {
		return nil, err
	}
	manager.vehicles = vehicles
	for _, line := range scenario.Lines {
		waypoints, err := convertWaypointsFromPersistence(line.Path)
		if err != nil {
			return nil, fmt.Errorf("could not understand path of line \"%s\": %v", line.Name, err)
		}
		lines[line.Key] = Line{
			Path:    waypoints,
			Name:    line.Name,
			Color:   line.Color,
			Key:     line.Key,
			Stops:   line.Stops,
			manager: &manager,
		}
	}
	for _, station := range scenario.Stations {
		latLng, _, err := polyline2.DecodeCoord([]byte(station.LatLng))
		if err != nil {
			return nil, fmt.Errorf("could not parse latlng of StationKeys \"%s\": %v", station.Name, err)
		}
		stations[station.Key] = Station{
			Key:        station.Key,
			Name:       station.Name,
			Lat:        latLng[0],
			Lng:        latLng[1],
			IsWaypoint: station.IsWaypoint,
			manager:    &manager,
		}
	}
	return &manager, nil
}

func convertTimetablesFromPersistence(manager *Manager, timetables []persistence.Timetable) map[string]Timetable {
	result := make(map[string]Timetable)
	for _, timetable := range timetables {
		tours := make([]Tour, 0, len(timetable.Tours))
		for _, tour := range timetable.Tours {
			events := make([]ArrivalDeparture, 0, len(tour.Events))
			for _, event := range tour.Events {
				events = append(events, ArrivalDeparture{
					Arrival:   event.Arrival,
					Departure: event.Departure,
				})
			}
			tours = append(tours, Tour{
				IntervalMinutes: tour.IntervalMinutes,
				LastTour:        tour.LastTour,
				Events:          events,
			})
		}
		result[timetable.Key] = Timetable{
			Key:         timetable.Key,
			LineKey:     timetable.Line,
			Name:        timetable.Name,
			Tours:       tours,
			StationKeys: timetable.Stations,
			manager:     manager,
		}
	}
	return result
}

func convertVehiclesFromPersistence(manager *Manager, vehicles []persistence.Vehicle) (map[string]Vehicle, error) {
	result := make(map[string]Vehicle)
	for _, vehicle := range vehicles {
		tasks := make([]Task, 0, len(vehicle.Tasks))
		for index, task := range vehicle.Tasks {
			converted := Task{Start: task.Start}
			if task.Type == RoamingTaskType.Key() {
				waypoints, err := convertWaypointsFromPersistence(*task.Path)
				if err != nil {
					return nil, fmt.Errorf("could not read waypoints of task %d of vehicle \"%s\": %v", index, vehicle.Key, err)
				}
				converted.Path = waypoints
				converted.Type = RoamingTaskType
			} else if task.Type == LineTaskType.Key() {
				converted.TimetableKey = task.TimetableKey
				converted.PathIndex = task.PathIndex
				converted.Type = LineTaskType
			} else {
				return nil, fmt.Errorf("could not undertand type of task %d: allowed are \"%s\" and \"%s\", got \"%s\"", index, RoamingTaskType.Key(), LineTaskType.Key(), task.Type)
			}
			converted.manager = manager
			tasks = append(tasks, converted)
		}
		position, _, err := polyline2.DecodeCoord(([]byte)(vehicle.Position))
		if err != nil {
			return nil, fmt.Errorf("could not read position of vehicle \"%s\": %v", vehicle.Key, err)
		}
		result[vehicle.Key] = Vehicle{
			Name:     vehicle.Name,
			Key:      vehicle.Key,
			Position: position,
			Tasks:    tasks,
			manager:  manager,
		}
	}
	return result, nil
}

func (m *Manager) Export() persistence.Scenario {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	stations := make([]persistence.Station, 0, len(m.stations))
	for _, station := range m.Stations() {
		stations = append(stations, persistence.Station{
			Key:  station.Key,
			Name: station.Name,
			LatLng: string(polyline2.EncodeCoord([]float64{
				station.Lat,
				station.Lng,
			})),
			IsWaypoint: station.IsWaypoint,
		})
	}
	lines := make([]persistence.Line, 0, len(m.lines))
	for _, line := range m.Lines() {
		lines = append(lines, persistence.Line{
			Stops: line.Stops,
			Path:  convertWaypointsToPersistence(line.Path),
			Name:  line.Name,
			Color: line.Color,
			Key:   line.Key,
		})
	}
	return persistence.Scenario{
		Stations:   stations,
		Lines:      lines,
		Timetables: m.convertTimetablesToPersistence(),
		Vehicles:   m.convertVehiclesToPersistence(),
		Center: persistence.Center{
			Lat:  m.Center.Lat,
			Lng:  m.Center.Lng,
			Zoom: m.Center.Zoom,
		},
	}
}

func (m *Manager) convertTimetablesToPersistence() []persistence.Timetable {
	timetables := make([]persistence.Timetable, 0, len(m.timetables))
	for _, timetable := range m.Timetables() {
		tours := make([]persistence.Tour, 0, len(timetable.Tours))
		for _, tour := range timetable.Tours {
			events := make([]persistence.ArrivalDeparture, 0, len(tour.Events))
			for _, event := range tour.Events {
				events = append(events, persistence.ArrivalDeparture{
					Arrival:   event.Arrival,
					Departure: event.Departure,
				})
			}
			tours = append(tours, persistence.Tour{
				IntervalMinutes: tour.IntervalMinutes,
				LastTour:        tour.LastTour,
				Events:          events,
			})
		}
		timetables = append(timetables, persistence.Timetable{
			Key:      timetable.Key,
			Line:     timetable.LineKey,
			Name:     timetable.Name,
			Stations: timetable.StationKeys,
			Tours:    tours,
		})

	}
	return timetables
}

func (m *Manager) convertVehiclesToPersistence() []persistence.Vehicle {
	vehicles := make([]persistence.Vehicle, 0, len(m.vehicles))
	for _, vehicle := range m.vehicles {
		tasks := make([]persistence.Task, 0, len(vehicle.Tasks))
		for _, task := range vehicle.Tasks {
			converted := persistence.Task{
				Start: task.Start,
				Type:  task.Type.Key(),
			}
			if task.Type.Key() == RoamingTaskType.Key() {
				path := convertWaypointsToPersistence(task.Path)
				converted.Path = &path
			} else if task.Type.Key() == LineTaskType.Key() {
				converted.TimetableKey = task.TimetableKey
				converted.PathIndex = task.PathIndex
			} else {
				panic(fmt.Sprintf("task type \"%s\" could be exported", task.Type.Key()))
			}
			tasks = append(tasks, converted)
		}
		vehicles = append(vehicles, persistence.Vehicle{
			Name:     vehicle.Name,
			Key:      vehicle.Key,
			Position: string(polyline2.EncodeCoord(vehicle.Position)),
			Tasks:    tasks,
		})
	}
	sort.Slice(vehicles, func(i, j int) bool {
		return vehicles[i].Key < vehicles[j].Key
	})
	return vehicles
}

func convertWaypointsFromPersistence(path persistence.Path) ([]Waypoint, error) {
	coords, _, err := polyline2.DecodeCoords([]byte(path.Geometry))
	if err != nil {
		return nil, fmt.Errorf("could not parse path geometry: %v", err)
	}
	if len(coords) != len(path.Meta) {
		return nil, fmt.Errorf("the length of the path's meta %d is not equal to the geometry lenght %d", len(path.Meta), len(coords))
	}
	waypoints := make([]Waypoint, 0, len(coords))
	for index, coord := range coords {
		waypoints = append(waypoints, Waypoint{
			Lat:  coord[0],
			Lng:  coord[1],
			Dist: path.Meta[index].Dist,
			Dur:  path.Meta[index].Dur,
			Stop: path.Meta[index].Stop,
		})
	}
	return waypoints, nil
}

func convertWaypointsToPersistence(waypoints []Waypoint) persistence.Path {
	coords := make([][]float64, 0, len(waypoints))
	meta := make([]persistence.MetaCoord, 0, len(waypoints))
	for _, wp := range waypoints {
		coords = append(coords, []float64{wp.Lat, wp.Lng})
		meta = append(meta, persistence.MetaCoord{
			Dist: wp.Dist,
			Dur:  wp.Dur,
			Stop: wp.Stop,
		})
	}
	return persistence.Path{
		Geometry: string(polyline2.EncodeCoords(coords)),
		Meta:     meta,
	}
}
