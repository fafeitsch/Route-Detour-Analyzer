package scenario

import (
	"encoding/json"
	"fmt"
	gonanoid "github.com/matoous/go-nanoid"
	"os"
	"sort"
	"sync"
)

type Center struct {
	Lat  float64
	Lng  float64
	Zoom int
}

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

type Tour struct {
	IntervalMinutes int
	LastTour        string
	Events          []ArrivalDeparture
}

type ArrivalDeparture struct {
	Arrival   string
	Departure string
}

type Manager struct {
	filePath   string
	lines      map[string]Line
	stations   map[string]Station
	timetables map[string]Timetable
	vehicles   map[string]Vehicle
	mutex      sync.RWMutex
	Center     Center
}

func Empty() *Manager {
	return &Manager{
		filePath:   "",
		Center:     Center{},
		lines:      make(map[string]Line),
		stations:   make(map[string]Station),
		timetables: make(map[string]Timetable),
		vehicles:   make(map[string]Vehicle),
		mutex:      sync.RWMutex{},
	}
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
