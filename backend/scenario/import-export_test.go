package scenario

import (
	"backend/persistence"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"path/filepath"
	"sync"
	"testing"
)

func TestLoadFile(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		manager, err := LoadScenario(filepath.Join("..", "testdata", "wuerzburg"))
		require.NoError(t, err)
		assert.Equal(t, 40, len(manager.lines))

		line9 := manager.lines["8jBhzRm9LI"]
		assert.Equal(t, "Linie 9: Residenz → Festung", line9.Name)
		assert.Equal(t, 9, len(line9.Stops))
		assert.Equal(t, "#803a16", line9.Color)
		assert.Equal(t, 205, len(line9.Path))
		assert.NotNil(t, line9.manager)

		wpBismark := manager.stations["9Cb54AQ0Gd"]
		assert.Equal(t, "Bismarckstraße", wpBismark.Name)
		assert.Equal(t, 49.8001, wpBismark.Lat)
		assert.Equal(t, 9.92603, wpBismark.Lng)
		assert.True(t, wpBismark.IsWaypoint)
		assert.NotNil(t, wpBismark.manager)

		timetable := manager.timetables["zQPCNCT67m"]
		assert.Equal(t, "v7OfcWzDB7", timetable.LineKey)
		assert.Equal(t, "Working Day", timetable.Name)
		assert.NotNil(t, timetable.manager)
		assert.Equal(t, 16, len(timetable.Tours))
		assert.Equal(t, 16, len(timetable.StationKeys))
		tour := timetable.Tours[11]
		assert.Equal(t, 16, len(tour.Events))
		assert.Equal(t, ArrivalDeparture{
			Departure: "8:44",
		}, tour.Events[10])
		assert.Equal(t, "19:11", tour.LastTour)
		assert.Equal(t, 8, tour.IntervalMinutes)

		assert.Equal(t, 313, len(manager.stations))
		assert.Equal(t, 21, len(manager.timetables))

		assert.Equal(t, 14, manager.Center.Zoom)
		assert.Equal(t, 49.789, manager.Center.Lat)
		assert.Equal(t, 9.9254, manager.Center.Lng)

		assert.Equal(t, filepath.Join("..", "testdata", "wuerzburg"), manager.filePath)
	})
	t.Run("does not exist, should create new scenario", func(t *testing.T) {
		manager, err := LoadScenario("non_existing")
		require.NoError(t, err)
		assert.Equal(t, map[string]Line{}, manager.lines)
		assert.Equal(t, map[string]Timetable{}, manager.timetables)
		assert.Equal(t, map[string]Station{}, manager.stations)
		assert.Equal(t, "non_existing", manager.filePath)
	})
}

func Test_convertVehicleFromPersistence(t *testing.T) {
	timetableKey := "tt1"
	pathIndex := 110
	t.Run("success", func(t *testing.T) {
		vehicle := persistence.Vehicle{
			Name:     "Vehicle 1",
			Key:      "v1",
			Position: "_c`|@_mcbA",
			Tasks: []persistence.Task{
				{
					Start: "10:00",
					Type:  "roaming",
					Path: &persistence.Path{
						Geometry: "_c`|@_mcbA~po]~hbE",
						Meta: []persistence.MetaCoord{
							{
								Dist: 9,
								Dur:  8,
							}, {
								Dist: 0,
								Dur:  0,
							},
						},
					},
				}, {
					Start:        "12:00",
					Type:         "line",
					TimetableKey: &timetableKey,
					PathIndex:    &pathIndex,
				},
			},
		}
		m := Empty()
		converted, err := convertVehicleFromPersistence(m, vehicle)
		vehicle1 := Vehicle{
			Name:     "Vehicle 1",
			Key:      "v1",
			Position: []float64{10, 11},
			manager:  m,
			Tasks: []Task{
				{
					Start: "10:00",
					Type:  RoamingTaskType,
					Path: []Waypoint{
						{Lat: 10, Lng: 11, Dist: 9, Dur: 8},
						{Lat: 5, Lng: 10},
					},
					manager: m,
				},
				{
					Start:        "12:00",
					Type:         LineTaskType,
					PathIndex:    &pathIndex,
					TimetableKey: &timetableKey,
					manager:      m,
				},
			},
		}
		require.NoError(t, err)
		assert.Equal(t, vehicle1, converted)
	})
	t.Run("invalid coordinates", func(t *testing.T) {
		vehicle := persistence.Vehicle{
			Name:     "Vehicle 1",
			Key:      "v1",
			Position: "_c`|@_mcbA",
			Tasks: []persistence.Task{
				{
					Start: "10:00",
					Type:  "roaming",
					Path: &persistence.Path{
						Geometry: "invalid",
					},
				},
			},
		}
		m := Empty()
		_, err := convertVehicleFromPersistence(m, vehicle)
		require.EqualError(t, err, "could not read waypoints of task 0 of vehicle \"v1\": could not parse path geometry: unterminated sequence")
	})
	t.Run("invalid position", func(t *testing.T) {
		vehicle := persistence.Vehicle{
			Name:     "Vehicle 1",
			Key:      "v1",
			Position: "invalid",
			Tasks:    []persistence.Task{},
		}
		m := Empty()
		_, err := convertVehicleFromPersistence(m, vehicle)
		require.EqualError(t, err, "could not read position of vehicle \"v1\": unterminated sequence")
	})
	t.Run("invalid type", func(t *testing.T) {
		vehicle := persistence.Vehicle{
			Name:     "Vehicle 1",
			Key:      "v1",
			Position: "_c`|@_mcbA",
			Tasks:    []persistence.Task{{Type: "invalid"}},
		}
		m := Empty()
		_, err := convertVehicleFromPersistence(m, vehicle)
		require.EqualError(t, err, "could not undertand type of task 0 of vehicle v1: allowed are \"roaming\" and \"line\", got \"invalid\"")
	})
}

func TestManager_convertVehiclesToPersistence(t *testing.T) {
	timetableKey := "tt1"
	pathIndex := 110
	vehicle1 := Vehicle{
		Name:     "Vehicle 1",
		Key:      "v1",
		Position: []float64{10, 11},
		Tasks: []Task{
			{
				Start: "10:00",
				Type:  RoamingTaskType,
				Path: []Waypoint{
					{Lat: 10, Lng: 11, Dist: 9, Dur: 8},
					{Lat: 5, Lng: 10},
				},
			},
			{
				Start:        "12:00",
				Type:         LineTaskType,
				PathIndex:    &pathIndex,
				TimetableKey: &timetableKey,
			},
		},
	}
	vehicle2 := Vehicle{
		Name:     "Vehicle 2",
		Key:      "v2",
		Position: []float64{13, 14},
		Tasks:    []Task{},
	}
	m := Empty()
	m.vehicles = map[string]Vehicle{
		vehicle1.Key: vehicle1,
		vehicle2.Key: vehicle2,
	}
	got := m.convertVehiclesToPersistence()
	assert.Equal(t, []persistence.Vehicle{
		{
			Name:     "Vehicle 1",
			Key:      "v1",
			Position: "_c`|@_mcbA",
			Tasks: []persistence.Task{
				{
					Start: "10:00",
					Type:  "roaming",
					Path: &persistence.Path{
						Geometry: "_c`|@_mcbA~po]~hbE",
						Meta: []persistence.MetaCoord{
							{
								Dist: 9,
								Dur:  8,
							}, {
								Dist: 0,
								Dur:  0,
							},
						},
					},
				}, {
					Start:        "12:00",
					Type:         "line",
					TimetableKey: &timetableKey,
					PathIndex:    &pathIndex,
				},
			},
		}, {
			Name:     "Vehicle 2",
			Key:      "v2",
			Position: "_ajnA_kmtA",
			Tasks:    []persistence.Task{},
		},
	}, got)
}

func TestManager_Export1(t *testing.T) {
	type fields struct {
		filePath   string
		lines      map[string]Line
		stations   map[string]Station
		timetables map[string]Timetable
		vehicles   map[string]Vehicle
		mutex      sync.RWMutex
		Center     Center
	}
	tests := []struct {
		name   string
		fields fields
		want   map[string][]byte
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				filePath:   tt.fields.filePath,
				lines:      tt.fields.lines,
				stations:   tt.fields.stations,
				timetables: tt.fields.timetables,
				vehicles:   tt.fields.vehicles,
				mutex:      tt.fields.mutex,
				Center:     tt.fields.Center,
			}
			assert.Equalf(t, tt.want, m.Export(), "Export()")
		})
	}
}
