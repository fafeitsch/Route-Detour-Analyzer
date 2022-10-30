package scenario

import (
	"fmt"
	gonanoid "github.com/matoous/go-nanoid"
	"sort"
)

type Vehicle struct {
	Name     string
	Key      string
	Position []float64
	Tasks    []Task
	manager  *Manager
}

type TaskType struct {
	key string
}

func (t *TaskType) Key() string {
	return t.key
}

func GetTaskType(key string) (TaskType, error) {
	if key == UnknownTaskType.key {
		return UnknownTaskType, nil
	}
	if key == LineTaskType.key {
		return LineTaskType, nil
	}
	if key == RoamingTaskType.key {
		return RoamingTaskType, nil
	}
	return UnknownTaskType,
		fmt.Errorf("there is no error type \"%s\", use \"%s\", or \"%s\", or \"%s\"", key, UnknownTaskType.key, LineTaskType.key, RoamingTaskType.key)
}

var (
	UnknownTaskType = TaskType{key: ""}
	RoamingTaskType = TaskType{key: "roaming"}
	LineTaskType    = TaskType{key: "line"}
)

type Task struct {
	Start string
	Type  TaskType
	// Free roaming properties
	Path []Waypoint
	// Line/Timetable properties
	TimetableKey *string
	PathIndex    *int
	manager      *Manager
}

func (t *Task) Timetable() Timetable {
	if t.Type.Key() != LineTaskType.Key() {
		panic("the task is not of line type: it has no timetable")
	}
	return t.manager.timetables[*t.TimetableKey]
}

// func (t *Task) Tour() Tour {
// 	return t.Timetable().Tours[*t.TourIndex]
// }

func (t *Task) RemainingPath() []Waypoint {
	if t.Type.key == LineTaskType.key {
		timetable := t.Timetable()
		linePath := timetable.Line().Path
		return linePath[*t.PathIndex:]
	} else if t.Type.key == RoamingTaskType.key {
		return t.Path
	}
	return []Waypoint{}
}

func (m *Manager) SaveVehicle(vehicle Vehicle) Vehicle {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	if vehicle.Key == "" {
		vehicle.Key = gonanoid.MustID(10)
	}
	for index, _ := range vehicle.Tasks {
		vehicle.Tasks[index].manager = m
	}
	vehicle.manager = m
	m.vehicles[vehicle.Key] = vehicle
	return vehicle
}

func (m *Manager) DeleteVehicle(key string) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	delete(m.vehicles, key)
}

func (m *Manager) Vehicles() []Vehicle {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	result := make([]Vehicle, 0, len(m.vehicles))
	for _, vehicle := range m.vehicles {
		result = append(result, vehicle)
	}
	sort.Slice(result, sortVehicles(result))
	return result
}

func (m *Manager) Vehicle(key string) (Vehicle, bool) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	vehicle, ok := m.vehicles[key]
	return vehicle, ok
}
