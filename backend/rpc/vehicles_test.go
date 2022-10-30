package rpc

import (
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestVehicleHandler_Methods(t *testing.T) {
	t.Run("save vehicle – error", func(t *testing.T) {
		handler := vehicleHandler{manager: scenario.Empty()}
		vehicle := types.Vehicle{
			Name:  "Test Vehicle",
			Tasks: []types.Task{{Type: "anything"}},
		}
		_, err := handler.Methods()["saveVehicle"].method(mustMarshal(vehicle))
		assert.EqualError(t, err, "vehicle \"Test Vehicle\", task 0: there is no error type \"anything\", use \"\", or \"line\", or \"roaming\"")
	})
	t.Run("save vehicle – success (new)", func(t *testing.T) {
		dist := 12.3
		dur := 10.2
		handler := vehicleHandler{manager: scenario.Empty()}
		vehicle := types.Vehicle{
			Name: "Test Vehicle",
			Tasks: []types.Task{
				{
					Type: "roaming",
					Path: []types.Waypoint{
						{
							Lat:  88,
							Lng:  99,
							Dist: &dist,
							Dur:  &dur,
						},
					},
				},
			},
		}
		method := handler.Methods()["saveVehicle"].method
		result, err := method(mustMarshal(vehicle))
		require.NoError(t, err)
		var got types.Vehicle
		_ = json.Unmarshal(result, &got)
		assert.NotEmpty(t, got.Key)
		assert.Equal(t, vehicle.Tasks, got.Tasks)
		assert.Equal(t, vehicle.Name, got.Name)
		assert.Equal(t, 1, len(handler.manager.Vehicles()))
		saved, _ := handler.manager.Vehicle(got.Key)
		assert.Equal(t, "Test Vehicle", saved.Name)
	})
	t.Run("save vehicle – success (existing)", func(t *testing.T) {
		dist := 12.3
		dur := 10.2
		handler := vehicleHandler{manager: scenario.Empty()}
		handler.manager.SaveVehicle(scenario.Vehicle{Key: "123"})
		assert.Equal(t, 1, len(handler.manager.Vehicles()))
		vehicle := types.Vehicle{
			Key:  "123",
			Name: "Test Vehicle",
			Tasks: []types.Task{
				{
					Type: "roaming",
					Path: []types.Waypoint{
						{
							Lat:  88,
							Lng:  99,
							Dist: &dist,
							Dur:  &dur,
						},
					},
				},
			},
		}
		method := handler.Methods()["saveVehicle"].method
		result, err := method(mustMarshal(vehicle))
		require.NoError(t, err)
		var got types.Vehicle
		_ = json.Unmarshal(result, &got)
		assert.NotEmpty(t, got.Key)
		assert.Equal(t, vehicle.Tasks, got.Tasks)
		assert.Equal(t, vehicle.Name, got.Name)
		assert.Equal(t, 1, len(handler.manager.Vehicles()))
		saved, _ := handler.manager.Vehicle(got.Key)
		assert.Equal(t, "Test Vehicle", saved.Name)
	})
	t.Run("save vehicle metadata – success", func(t *testing.T) {
		dist := 12.3
		dur := 10.2
		handler := vehicleHandler{manager: scenario.Empty()}
		vehicle := scenario.Vehicle{
			Key:  "123",
			Name: "Test Vehicle",
			Tasks: []scenario.Task{
				{
					Type: scenario.RoamingTaskType,
					Path: []scenario.Waypoint{
						{
							Lat:  88,
							Lng:  99,
							Dist: dist,
							Dur:  dur,
						},
					},
				},
			},
		}
		handler.manager.SaveVehicle(vehicle)
		assert.Equal(t, 1, len(handler.manager.Vehicles()))
		method := handler.Methods()["saveVehicleMetadata"].method
		result, err := method(mustMarshal(types.Vehicle{
			Name:     "Changed Name",
			Key:      "123",
			Position: types.LatLng{Lat: 5, Lng: 6},
		}))
		require.NoError(t, err)
		var got types.Vehicle
		_ = json.Unmarshal(result, &got)
		assert.NotEmpty(t, got.Key)
		assert.Equal(t, []types.Task{
			{
				Type: "roaming",
				Path: []types.Waypoint{
					{
						Lat:  88,
						Lng:  99,
						Dist: &dist,
						Dur:  &dur,
					},
				},
			},
		}, got.Tasks)
		assert.Equal(t, "Changed Name", got.Name)
		assert.Equal(t, types.LatLng{Lat: 5, Lng: 6}, got.Position)
		assert.Equal(t, 1, len(handler.manager.Vehicles()))
		saved, _ := handler.manager.Vehicle(got.Key)
		assert.Equal(t, "Changed Name", saved.Name)
		assert.Equal(t, 1, len(saved.Tasks))
	})
	t.Run("save vehicle metadata – error", func(t *testing.T) {
		handler := vehicleHandler{manager: scenario.Empty()}
		method := handler.Methods()["saveVehicleMetadata"].method
		_, err := method(mustMarshal(types.Vehicle{
			Name:     "Changed Name",
			Key:      "123",
			Position: types.LatLng{Lat: 5, Lng: 6},
		}))
		assert.EqualError(t, err, "the vehicle with key \"123\" was not found")
	})
	t.Run("get vehicles", func(t *testing.T) {
		handler := vehicleHandler{manager: scenario.Empty()}
		dist := 11.0
		dur := 12.0
		timetableKey := "tt1"
		pathIndex := 312
		vehicle := scenario.Vehicle{
			Name: "Vehicle 1",
			Key:  "abc",
			Position: []float64{
				500.0, 600.0,
			},
			Tasks: []scenario.Task{
				{
					Type: scenario.RoamingTaskType,
					Path: []scenario.Waypoint{
						{
							Lat:  10,
							Lng:  20,
							Dist: dist,
							Dur:  dur,
							Stop: true,
						},
					},
					Start: "8:32",
				}, {
					Start:        "8:45",
					Type:         scenario.LineTaskType,
					TimetableKey: &timetableKey,
					PathIndex:    &pathIndex,
				},
			},
		}
		handler.manager.SaveVehicle(vehicle)
		got, err := handler.Methods()["getVehicles"].method(nil)
		require.NoError(t, err)
		var result []types.Vehicle
		_ = json.Unmarshal(got, &result)
		assert.Equal(t, []types.Vehicle{
			{
				Name: "Vehicle 1",
				Key:  "abc",
				Position: types.LatLng{
					Lat: 500.0, Lng: 600.0,
				},
				Tasks: []types.Task{
					{
						Type: "roaming",
						Path: []types.Waypoint{
							{
								Lat:  10,
								Lng:  20,
								Dist: &dist,
								Dur:  &dur,
								Stop: true,
							},
						},
						Start: "8:32",
					}, {
						Start:        "8:45",
						Type:         "line",
						TimetableKey: &timetableKey,
						PathIndex:    &pathIndex,
					},
				},
			},
		}, result)
	},
	)
	t.Run("delete vehicle", func(t *testing.T) {
		handler := vehicleHandler{manager: scenario.Empty()}
		vehicle := scenario.Vehicle{
			Name: "Vehicle 1",
			Key:  "abc",
		}
		handler.manager.SaveVehicle(vehicle)
		assert.Equal(t, 1, len(handler.manager.Vehicles()))
		_, err := handler.Methods()["deleteVehicle"].method(mustMarshal(vehicle))
		require.NoError(t, err)
		assert.Equal(t, 0, len(handler.manager.Vehicles()))
	},
	)
	t.Run("get vehicle – success", func(t *testing.T) {
		handler := vehicleHandler{manager: scenario.Empty()}
		vehicle := scenario.Vehicle{
			Name:     "Vehicle 1",
			Key:      "abc",
			Position: []float64{3, 4},
		}
		handler.manager.SaveVehicle(vehicle)
		raw, err := handler.Methods()["getVehicle"].method(mustMarshal(vehicle))
		require.NoError(t, err)
		var got types.Vehicle
		_ = json.Unmarshal(raw, &got)
		assert.Equal(t, types.Vehicle{
			Key:      "abc",
			Name:     "Vehicle 1",
			Position: types.LatLng{Lat: 3, Lng: 4},
			Tasks:    []types.Task{},
		}, got)
	})
	t.Run("get vehicle – not found", func(t *testing.T) {
		handler := vehicleHandler{manager: scenario.Empty()}
		vehicle := types.Vehicle{
			Key: "abc",
		}
		_, err := handler.Methods()["getVehicle"].method(mustMarshal(vehicle))
		assert.EqualError(t, err, "the vehicle with key \"abc\" was not found")
	})
}
