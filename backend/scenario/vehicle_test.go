package scenario

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestManager_Vehicle(t *testing.T) {
	manager := Empty()
	manager.SaveVehicle(Vehicle{Key: "abc"})
	result, ok := manager.Vehicle("abc")
	assert.Equal(t, Vehicle{Key: "abc", manager: manager}, result)
	assert.True(t, ok)

	result, ok = manager.Vehicle("xxx")
	assert.Equal(t, Vehicle{}, result)
	assert.False(t, ok)
}

func TestManager_Vehicles(t *testing.T) {
	manager := Empty()
	manager.SaveVehicle(Vehicle{Key: "abc", Name: "Vehicle 1"})
	manager.SaveVehicle(Vehicle{Key: "def", Name: "Vehicle 1"})
	manager.SaveVehicle(Vehicle{Key: "xyz", Name: "A Vehicle"})
	result := manager.Vehicles()
	assert.Equal(t, []Vehicle{
		{Key: "xyz", Name: "A Vehicle", manager: manager},
		{Key: "abc", Name: "Vehicle 1", manager: manager},
		{Key: "def", Name: "Vehicle 1", manager: manager},
	}, result)
}

func TestManager_SaveVehicle(t *testing.T) {
	manager := Empty()
	vehicle := manager.SaveVehicle(Vehicle{Name: "v1"})
	assert.NotEmpty(t, vehicle.Key)
	assert.Equal(t, "v1", vehicle.Name)
	assert.Equal(t, manager, vehicle.manager)
	got, _ := manager.Vehicle(vehicle.Key)
	assert.Equal(t, "v1", got.Name)
	key := vehicle.Key
	vehicle.Name = "v2"
	vehicle = manager.SaveVehicle(vehicle)
	assert.Equal(t, key, vehicle.Key)
	assert.Equal(t, "v2", vehicle.Name)
	got, _ = manager.Vehicle(vehicle.Key)
	assert.Equal(t, "v2", got.Name)
}

func TestTask_Timetable(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		manager := Empty()
		timetable := manager.SaveTimetable(Timetable{Name: "Test Timetable"})
		vehicle := manager.SaveVehicle(Vehicle{
			Tasks: []Task{
				{
					Type:         LineTaskType,
					TimetableKey: &timetable.Key,
				},
			},
		})
		task := vehicle.Tasks[0]
		assert.Equal(t, Timetable{
			Name:    "Test Timetable",
			Key:     timetable.Key,
			manager: manager,
		}, task.Timetable())
	})
	t.Run("wrong type", func(t *testing.T) {
		manager := Empty()
		vehicle := manager.SaveVehicle(Vehicle{
			Tasks: []Task{
				{
					Type: RoamingTaskType,
				},
			},
		})
		task := vehicle.Tasks[0]
		assert.PanicsWithValue(t, "the task is not of line type: it has no timetable", func() {
			task.Timetable()
		})
	})
}

// func TestTask_Tour(t *testing.T) {
// 	manager := Empty()
// 	timetable := manager.SaveTimetable(Timetable{
// 		Name:  "Test Timetable",
// 		Tours: []Tour{{LastTour: "16:38"}, {LastTour: "17:00"}},
// 	})
// 	index := 1
// 	vehicle := manager.SaveVehicle(Vehicle{
// 		Tasks: []Task{
// 			{
// 				Type:         LineTaskType,
// 				TimetableKey: &timetable.Key,
// 				TourIndex:    &index,
// 			},
// 		},
// 	})
// 	task := vehicle.Tasks[0]
// 	assert.Equal(t, Tour{
// 		LastTour: "17:00",
// 	}, task.Tour())
// }

func TestTask_RemainingPath(t *testing.T) {
	t.Run("roaming", func(t *testing.T) {
		task := Task{
			Type: RoamingTaskType,
			Path: []Waypoint{{Lat: 8, Lng: 9, Dist: 10, Dur: 11}},
		}
		path := task.RemainingPath()
		assert.Equal(t, []Waypoint{{Lat: 8, Lng: 9, Dist: 10, Dur: 11}}, path)
	})
	t.Run("line", func(t *testing.T) {
		timetableKey := "abc"
		pathIndex := 1
		task := Task{
			Type:         LineTaskType,
			TimetableKey: &timetableKey,
			PathIndex:    &pathIndex,
		}
		manager := Empty()
		manager.SaveTimetable(Timetable{Key: timetableKey, LineKey: "xyz"})
		manager.SaveLine(Line{
			Key:  "xyz",
			Path: []Waypoint{{Dist: 9}, {Dist: 10}, {Dist: 11}},
		})
		task.manager = manager
		remaining := task.RemainingPath()
		assert.Equal(t, []Waypoint{{Dist: 10}, {Dist: 11}}, remaining)
	})
	t.Run("wrong type", func(t *testing.T) {
		task := Task{
			Type: UnknownTaskType,
		}
		assert.Equal(t, []Waypoint{}, task.RemainingPath())
	})
}

func TestManager_DeleteVehicle(t *testing.T) {
	t.Run("existing", func(t *testing.T) {
		manager := Empty()
		vehicle := manager.SaveVehicle(Vehicle{})
		assert.Equal(t, 1, len(manager.Vehicles()))
		manager.DeleteVehicle(vehicle.Key)
		assert.Equal(t, 0, len(manager.Vehicles()))
	})
	t.Run("not existing", func(t *testing.T) {
		manager := Empty()
		manager.SaveVehicle(Vehicle{})
		assert.Equal(t, 1, len(manager.Vehicles()))
		manager.DeleteVehicle("abc")
		assert.Equal(t, 1, len(manager.Vehicles()))
	})
}

func TestGetTaskType(t *testing.T) {
	tests := []struct {
		key       string
		wantType  TaskType
		wantError error
	}{
		{
			key:      "line",
			wantType: LineTaskType,
		}, {
			key:      "roaming",
			wantType: RoamingTaskType,
		}, {
			wantType: UnknownTaskType,
		}, {
			key:       "anything",
			wantType:  UnknownTaskType,
			wantError: fmt.Errorf("there is no error type \"anything\", use \"\", or \"line\", or \"roaming\""),
		},
	}
	for _, test := range tests {
		t.Run(test.key, func(t *testing.T) {
			got, err := GetTaskType(test.key)
			assert.Equal(t, test.wantType, got)
			assert.Equal(t, test.wantError, err)
		})
	}
}
