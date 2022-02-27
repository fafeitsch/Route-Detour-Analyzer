package scenario

import (
	"backend/persistence"
	"encoding/json"
	"fmt"
	gonanoid "github.com/matoous/go-nanoid"
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
	Path      []persistence.Waypoint
	Name      string
	Color     string
	Key       string
	Timetable persistence.Timetable
	manager   *Manager
}

func (l *Line) Stations() []Station {
	result := make([]Station, 0, 0)
	for _, stop := range l.Stops {
		result = append(result, l.manager.stations[stop])
	}
	return result
}

type Manager struct {
	filePath string
	lines    map[string]Line
	stations map[string]Station
	mutex    sync.RWMutex
}

func New(path string) (*Manager, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("could not open file \"%s\": %v", path, err)
	}
	var scenario persistence.Scenario
	err = json.NewDecoder(file).Decode(&scenario)
	if err != nil {
		return nil, fmt.Errorf("could not parse json file: %v", err)
	}
	lines := make(map[string]Line)
	stations := make(map[string]Station)
	manager := Manager{lines: lines, stations: stations, mutex: sync.RWMutex{}}
	for _, line := range scenario.Lines {
		stops := make([]string, 0, len(line.Stops))
		for _, stop := range line.Stops {
			stops = append(stops, stop.Key)
		}
		lines[line.Key] = Line{
			Path:      line.Path.Waypoints,
			Name:      line.Name,
			Color:     line.Color,
			Key:       line.Key,
			Stops:     stops,
			manager:   &manager,
			Timetable: line.Timetable,
		}
	}
	for _, station := range scenario.Stations {
		stations[station.Key] = Station{
			Key:        station.Key,
			Name:       station.Name,
			Lat:        station.Lat,
			Lng:        station.Lng,
			IsWaypoint: station.IsWaypoint,
			manager:    &manager,
		}
	}
	return &manager, nil
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
