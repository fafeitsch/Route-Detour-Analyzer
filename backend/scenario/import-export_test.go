package scenario

import (
	"backend/persistence"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadFile(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		manager, err := LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
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

		assert.Equal(t, 312, len(manager.stations))
		assert.Equal(t, 21, len(manager.timetables))

		assert.Equal(t, 14, manager.Center.Zoom)
		assert.Equal(t, 49.789, manager.Center.Lat)
		assert.Equal(t, 9.9254, manager.Center.Lng)

		assert.Equal(t, filepath.Join("..", "testdata", "wuerzburg.json"), manager.filePath)
	})
	t.Run("does not exist, should create new scenario", func(t *testing.T) {
		manager, err := LoadFile("non_existing")
		require.NoError(t, err)
		assert.Equal(t, map[string]Line{}, manager.lines)
		assert.Equal(t, map[string]Timetable{}, manager.timetables)
		assert.Equal(t, map[string]Station{}, manager.stations)
		assert.Equal(t, "non_existing", manager.filePath)
	})
}

func TestManager_Export(t *testing.T) {
	var raw persistence.Scenario
	{
		file, err := os.Open(filepath.Join("..", "testdata", "wuerzburg.json"))
		require.NoError(t, err)
		defer func() { _ = file.Close() }()
		err = json.NewDecoder(file).Decode(&raw)
		require.NoError(t, err)
		require.Equal(t, 312, len(raw.Stations))
	}
	loaded, err := LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	require.NoError(t, err)
	got := loaded.Export()
	assert.Equal(t, raw.Lines, got.Lines)
	assert.Equal(t, raw.Stations, got.Stations)
	assert.Equal(t, len(raw.Timetables), len(got.Timetables))
	for index, got := range raw.Timetables {
		assert.Equal(t, raw.Timetables[index], got)
	}
}

func Test_convertVehiclesFromPersistence(t *testing.T) {
	timetableKey := "tt1"
	tourIndex := 5
	pathIndex := 110
	t.Run("success", func(t *testing.T) {
		vehicles := []persistence.Vehicle{
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
						TourIndex:    &tourIndex,
						PathIndex:    &pathIndex,
					},
				},
			}, {
				Name:     "Vehicle 2",
				Key:      "v2",
				Position: "_ajnA_kmtA",
				Tasks:    []persistence.Task{},
			},
		}
		m := Empty()
		converted, err := convertVehiclesFromPersistence(m, vehicles)
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
					TourIndex:    &tourIndex,
					TimetableKey: &timetableKey,
					manager:      m,
				},
			},
		}
		vehicle2 := Vehicle{
			Name:     "Vehicle 2",
			Key:      "v2",
			Position: []float64{13, 14},
			Tasks:    []Task{},
			manager:  m,
		}
		wanted := map[string]Vehicle{
			vehicle1.Key: vehicle1,
			vehicle2.Key: vehicle2,
		}
		require.NoError(t, err)
		assert.Equal(t, wanted, converted)
	})
	t.Run("invalid coordinates", func(t *testing.T) {
		vehicles := []persistence.Vehicle{
			{
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
			},
		}
		m := Empty()
		_, err := convertVehiclesFromPersistence(m, vehicles)
		require.EqualError(t, err, "could not read waypoints of task 0 of vehicle \"v1\": could not parse path geometry: unterminated sequence")
	})
	t.Run("invalid position", func(t *testing.T) {
		vehicles := []persistence.Vehicle{
			{
				Name:     "Vehicle 1",
				Key:      "v1",
				Position: "invalid",
				Tasks:    []persistence.Task{},
			},
		}
		m := Empty()
		_, err := convertVehiclesFromPersistence(m, vehicles)
		require.EqualError(t, err, "could not read position of vehicle \"v1\": unterminated sequence")
	})
	t.Run("invalid type", func(t *testing.T) {
		vehicles := []persistence.Vehicle{
			{
				Name:     "Vehicle 1",
				Key:      "v1",
				Position: "_c`|@_mcbA",
				Tasks:    []persistence.Task{{Type: "invalid"}},
			},
		}
		m := Empty()
		_, err := convertVehiclesFromPersistence(m, vehicles)
		require.EqualError(t, err, "could not undertand type of task 0: allowed are \"roaming\" and \"line\", got \"invalid\"")
	})
}

func TestManager_convertVehiclesToPersistence(t *testing.T) {
	timetableKey := "tt1"
	tourIndex := 5
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
				TourIndex:    &tourIndex,
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
					TourIndex:    &tourIndex,
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
