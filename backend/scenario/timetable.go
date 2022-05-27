package scenario

import (
	gonanoid "github.com/matoous/go-nanoid"
	"sort"
)

type Timetable struct {
	Key         string
	LineKey     string
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

func (t *Timetable) Line() Line {
	return t.manager.lines[t.LineKey]
}

func (m *Manager) Timetables() []Timetable {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	result := make([]Timetable, 0, len(m.timetables))
	for _, tt := range m.timetables {
		result = append(result, tt)
	}
	sort.Slice(result, sortTimetables(result))
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
