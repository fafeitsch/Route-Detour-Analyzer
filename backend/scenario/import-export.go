package scenario

import (
	"backend/persistence"
	"encoding/json"
	"fmt"
	polyline2 "github.com/twpayne/go-polyline"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
)

func LoadScenario(path string) (*Manager, error) {
	lines := make(map[string]Line)
	timetables := make(map[string]Timetable)
	vehicles := make(map[string]Vehicle)
	stations := make(map[string]Station)
	manager := Manager{
		vehicles:   vehicles,
		timetables: timetables,
		lines:      lines,
		stations:   stations,
		mutex:      sync.RWMutex{},
		filePath:   path,
		Center: Center{
			Lat:  0,
			Lng:  0,
			Zoom: 0,
		},
	}
	err := filepath.WalkDir(path, func(path string, d fs.DirEntry, err error) error {
		if d == nil {
			return nil
		}
		if d.IsDir() {
			return nil
		}
		file, err := os.Open(path)
		defer func() { _ = file.Close() }()
		if err != nil {
			return fmt.Errorf("could not open file \"%s\": %v", path, err)
		}
		if strings.HasSuffix(path, "stations.json") {
			var stations []persistence.Station
			err = json.NewDecoder(file).Decode(&stations)
			if err != nil {
				return fmt.Errorf("could not read station.json: %v", err)
			}
			manager.stations, err = convertStationsFromPersistence(&manager, stations)
			return err
		} else if strings.HasSuffix(path, "scenario.json") {
			var scenario persistence.Scenario
			err = json.NewDecoder(file).Decode(&scenario)
			if err != nil {
				return fmt.Errorf("could not read scenario.json: %v", err)
			}
			manager.Center = Center{
				Lat:  scenario.Center.Lat,
				Lng:  scenario.Center.Lng,
				Zoom: scenario.Center.Zoom,
			}
			return nil
		}
		parts := strings.Split(path, string(os.PathSeparator))
		if len(parts) < 2 {
			return nil
		}
		topic := parts[len(parts)-2]
		if topic == "timetables" {
			var timetable persistence.Timetable
			err = json.NewDecoder(file).Decode(&timetable)
			if err != nil {
				return fmt.Errorf("could not read timetable file \"%s\": %v", path, err)
			}
			timetables[timetable.Key] = convertTimetableFromPersistence(&manager, timetable)
		} else if topic == "lines" {
			var line persistence.Line
			err = json.NewDecoder(file).Decode(&line)
			if err != nil {
				return fmt.Errorf("could not read line file \"%s\": %v", path, err)
			}
			waypoints, err := convertWaypointsFromPersistence(line.Path)
			if err != nil {
				return fmt.Errorf("could not understand path of line \"%s\": %v", line.Name, err)
			}
			lines[line.Key] = Line{
				Stops:   line.Stops,
				Path:    waypoints,
				Name:    line.Name,
				Color:   line.Color,
				Key:     line.Key,
				manager: &manager,
			}
		} else if topic == "vehicles" {
			var vehicle persistence.Vehicle
			err = json.NewDecoder(file).Decode(&vehicle)
			if err != nil {
				return fmt.Errorf("could not read vehicle file \"%s\": %v", path, err)
			}
			vehicles[vehicle.Key], err = convertVehicleFromPersistence(&manager, vehicle)
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("could not explore file structure of scenario \"%s\": %v", path, err)
	}
	return &manager, nil
}

func convertStationsFromPersistence(manager *Manager, stations []persistence.Station) (map[string]Station, error) {
	result := make(map[string]Station)
	for _, station := range stations {
		latLng, _, err := polyline2.DecodeCoord([]byte(station.LatLng))
		if err != nil {
			return nil, fmt.Errorf("could not read waypoints of station \"%s\": %v", station.Key, err)
		}
		result[station.Key] = Station{
			Key:        station.Key,
			Name:       station.Name,
			Lat:        latLng[0],
			Lng:        latLng[1],
			IsWaypoint: station.IsWaypoint,
			manager:    manager,
		}
	}
	return result, nil
}

func convertTimetableFromPersistence(manager *Manager, timetable persistence.Timetable) Timetable {
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
	return Timetable{
		Key:         timetable.Key,
		LineKey:     timetable.Line,
		Name:        timetable.Name,
		Tours:       tours,
		StationKeys: timetable.Stations,
		manager:     manager,
	}
}

func convertVehicleFromPersistence(manager *Manager, vehicle persistence.Vehicle) (Vehicle, error) {
	tasks := make([]Task, 0, len(vehicle.Tasks))
	for index, task := range vehicle.Tasks {
		converted := Task{Start: task.Start}
		if task.Type == RoamingTaskType.Key() {
			waypoints, err := convertWaypointsFromPersistence(*task.Path)
			if err != nil {
				return Vehicle{}, fmt.Errorf("could not read waypoints of task %d of vehicle \"%s\": %v", index, vehicle.Key, err)
			}
			converted.Path = waypoints
			converted.Type = RoamingTaskType
		} else if task.Type == LineTaskType.Key() {
			converted.TimetableKey = task.TimetableKey
			converted.PathIndex = task.PathIndex
			converted.Type = LineTaskType
		} else {
			return Vehicle{}, fmt.Errorf("could not undertand type of task %d of vehicle %s: allowed are \"%s\" and \"%s\", got \"%s\"", index, vehicle.Key,
				RoamingTaskType.Key(), LineTaskType.Key(), task.Type)
		}
		converted.manager = manager
		tasks = append(tasks, converted)
	}
	position, _, err := polyline2.DecodeCoord(([]byte)(vehicle.Position))
	if err != nil {
		return Vehicle{}, fmt.Errorf("could not read position of vehicle \"%s\": %v", vehicle.Key, err)
	}
	return Vehicle{
		Name:     vehicle.Name,
		Key:      vehicle.Key,
		Position: position,
		Tasks:    tasks,
		manager:  manager,
	}, nil
}

func (m *Manager) Persist() error {
	files := m.Export()
	_ = os.MkdirAll(m.filePath, os.ModePerm)
	for key, value := range files {
		err := func() error {
			parts := strings.Split(key, "/")
			if len(parts) > 1 {
				directories := filepath.Join(m.filePath, filepath.Join(parts[:len(parts)-1]...))
				_ = os.MkdirAll(directories, os.ModePerm)
			}
			path := filepath.Join(m.filePath, filepath.Join(parts...))
			file, err := os.OpenFile(path, os.O_RDWR|os.O_TRUNC|os.O_CREATE, 0755)
			if err != nil {
				return fmt.Errorf("could not open file \"%s\": %v", m.filePath, err)
			}
			defer func() { _ = file.Close() }()
			encoder := json.NewEncoder(file)
			encoder.SetIndent("", " ")
			return encoder.Encode(value)

		}()
		if err != nil {
			return fmt.Errorf("could not write to file \"%s\", %v", key, err)
		}
	}
	return nil
}

func (m *Manager) Export() map[string]any {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	result := make(map[string]any)
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
	result["stations.json"] = stations
	for _, line := range m.Lines() {
		persistedLine := persistence.Line{
			Stops: line.Stops,
			Path:  convertWaypointsToPersistence(line.Path),
			Name:  line.Name,
			Color: line.Color,
			Key:   line.Key,
		}
		result["lines/"+persistedLine.Key+".json"] = persistedLine
	}
	for _, timetable := range m.convertTimetablesToPersistence() {
		result["timetables/"+timetable.Key+".json"] = timetable
	}
	for _, vehicle := range m.convertVehiclesToPersistence() {
		result["vehicles/"+vehicle.Key+".json"] = vehicle
	}
	scenario := persistence.Scenario{
		Center: persistence.Center{
			Lat:  m.Center.Lat,
			Lng:  m.Center.Lng,
			Zoom: m.Center.Zoom,
		},
	}
	result["scenario.json"] = scenario
	return result
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
