package scenario

import (
	"backend/persistence"
	"encoding/json"
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
	Stops   []string
	Path    []Waypoint
	Name    string
	Color   string
	Key     string
	manager *Manager
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
	return result
}

type Timetable struct {
	Key         string
	Line        *string
	Name        string
	Tours       []Tour
	manager     *Manager
	StationKeys []string
}

func (t *Timetable) Stations() []Station {
	result := make([]Station, 0, len(t.StationKeys))
	for _, station := range t.StationKeys {
		result = append(result, t.manager.stations[station])
	}
	return result
}

type Tour struct {
	IntervalMinutes int
	LastTour        TimeString
	Events          []ArrivalDeparture
}

type ArrivalDeparture struct {
	Arrival   *TimeString
	Departure *TimeString
}

type Manager struct {
	filePath   string
	lines      map[string]Line
	stations   map[string]Station
	timetables map[string]Timetable
	mutex      sync.RWMutex
}

type TimeString string

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

func (m *Manager) Timetables() []Timetable {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	result := make([]Timetable, 0, len(m.timetables))
	for _, tt := range m.timetables {
		result = append(result, tt)
	}
	return result
}

func (m *Manager) SaveTimetable(timetable Timetable) Timetable {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	if timetable.Key == "" {
		timetable.Key = gonanoid.MustID(10)
	}
	timetable.manager = m
	m.timetables[timetable.Key] = timetable
	return timetable
}

func (m *Manager) Timetable(key string) (Timetable, bool) {
	timetable, ok := m.timetables[key]
	return timetable, ok
}

func (m *Manager) DeleteTimetable(key string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.timetables, key)
}
