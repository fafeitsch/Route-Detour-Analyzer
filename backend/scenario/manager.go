package scenario

import (
	"backend/persistence"
	"encoding/json"
	"errors"
	"fmt"
	gonanoid "github.com/matoous/go-nanoid"
	polyline2 "github.com/twpayne/go-polyline"
	"os"
	"sort"
	"sync"
)

type Station struct {
	Key        string
	Name       string
	Lat        float64
	Lng        float64
	IsWaypoint bool
	manager    *Manager
}

func (s *Station) Lines() []Line {
	s.manager.mutex.RLock()
	s.manager.mutex.RUnlock()
	result := make([]Line, 0, 0)
	for _, line := range s.manager.lines {
		for _, stop := range line.Stops {
			if stop == s.Key {
				result = append(result, line)
			}
		}
	}
	sort.Slice(result, sortLines(result))
	return result
}

type Line struct {
	Stops     []string
	Path      []Waypoint
	Name      string
	Color     string
	Key       string
	Timetable persistence.Timetable
	manager   *Manager
}

type Waypoint struct {
	Lat  float64
	Lng  float64
	Dist float64
	Dur  float64
	Stop bool
}

func (l *Line) Stations() []Station {
	l.manager.mutex.RLock()
	defer l.manager.mutex.RUnlock()
	result := make([]Station, 0, 0)
	for _, stop := range l.Stops {
		result = append(result, l.manager.stations[stop])
	}
	sort.Slice(result, sortStations(result))
	return result
}

type Manager struct {
	filePath string
	lines    map[string]Line
	stations map[string]Station
	mutex    sync.RWMutex
}

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
	manager := Manager{lines: lines, stations: stations, mutex: sync.RWMutex{}, filePath: path}
	for _, line := range scenario.Lines {
		waypoints, err := convertWaypoints(line.Path)
		if err != nil {
			return nil, fmt.Errorf("could not understand path of line \"%s\": %v", line.Name, err)
		}
		lines[line.Key] = Line{
			Path:      waypoints,
			Name:      line.Name,
			Color:     line.Color,
			Key:       line.Key,
			Stops:     line.Stops,
			manager:   &manager,
			Timetable: line.Timetable,
		}
	}
	for _, station := range scenario.Stations {
		latLng, _, err := polyline2.DecodeCoord([]byte(station.LatLng))
		if err != nil {
			return nil, fmt.Errorf("could not parse latlng of station \"%s\": %v", station.Name, err)
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

func convertWaypoints(path persistence.Path) ([]Waypoint, error) {
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

func (m *Manager) Persist() error {
	file, err := os.OpenFile(m.filePath, os.O_RDWR|os.O_TRUNC|os.O_CREATE, 0755)
	if err != nil {
		return fmt.Errorf("could not open file \"%s\": %v", m.filePath, err)
	}
	defer func() { _ = file.Close() }()
	scenario := m.Export()
	return json.NewEncoder(file).Encode(scenario)
}

func (m *Manager) Line(key string) (Line, bool) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	line, ok := m.lines[key]
	return line, ok
}

func (m *Manager) Lines() []Line {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	lines := make([]Line, 0, len(m.lines))
	for _, line := range m.lines {
		lines = append(lines, line)
	}
	sort.Slice(lines, sortLines(lines))
	return lines
}

func (m *Manager) SaveLine(line Line) Line {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	for _, stop := range line.Stops {
		if _, ok := m.stations[stop]; !ok {
			panic(fmt.Sprintf("no stop with name \"%s\" exists", stop))
		}
	}
	if line.Key == "" {
		line.Key = gonanoid.MustID(10)
	}
	line.manager = m
	m.lines[line.Key] = line
	return line
}

func (m *Manager) DeleteLine(key string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.lines, key)
}

func (m *Manager) Station(key string) (Station, bool) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	station, ok := m.stations[key]
	return station, ok
}

func (m *Manager) Stations() []Station {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	stations := make([]Station, 0, len(m.stations))
	for _, station := range m.stations {
		stations = append(stations, station)
	}
	sort.Slice(stations, sortStations(stations))
	return stations
}

func (m *Manager) SaveStation(station Station) Station {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	if station.Key == "" {
		station.Key = gonanoid.MustID(10)
	}
	station.manager = m
	m.stations[station.Key] = station
	return station
}

func (m *Manager) DeleteStation(key string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.stations, key)
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
		coords := make([][]float64, 0, len(line.Path))
		meta := make([]persistence.MetaCoord, 0, len(line.Path))
		for _, wp := range line.Path {
			coords = append(coords, []float64{wp.Lat, wp.Lng})
			meta = append(meta, persistence.MetaCoord{
				Dist: wp.Dist,
				Dur:  wp.Dur,
				Stop: wp.Stop,
			})
		}
		lines = append(lines, persistence.Line{
			Stops: line.Stops,
			Path: persistence.Path{
				Geometry: string(polyline2.EncodeCoords(coords)),
				Meta:     meta,
			},
			Name:      line.Name,
			Color:     line.Color,
			Key:       line.Key,
			Timetable: line.Timetable,
		})
	}
	return persistence.Scenario{
		Stations: stations,
		Lines:    lines,
	}
}
