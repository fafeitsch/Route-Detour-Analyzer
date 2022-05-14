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
