package scenario

import (
	"backend/persistence"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	polyline2 "github.com/twpayne/go-polyline"
	"path/filepath"
	"strings"
	"testing"
)

func TestManager_DeleteLine(t *testing.T) {
	manager, err := LoadFile(filepath.Join("../testdata/wuerzburg.json"))
	require.NoError(t, err)
	t.Run("delete existing line", func(t *testing.T) {
		t.Parallel()
		_, ok := manager.Line("7BNJI4rUT6")
		assert.True(t, ok)
		manager.DeleteLine("7BNJI4rUT6")
		_, ok = manager.Line("7BNJI4rUT6")
		assert.False(t, ok)
	})
	t.Run("delete non existing line", func(t *testing.T) {
		t.Parallel()
		_, ok := manager.Line("X")
		assert.False(t, ok)
		manager.DeleteLine("X")
		_, ok = manager.Line("X")
		assert.False(t, ok)
	})
}

func TestManager_DeleteStation(t *testing.T) {
	manager, err := LoadFile(filepath.Join("../testdata/wuerzburg.json"))
	require.NoError(t, err)
	t.Run("delete existing station", func(t *testing.T) {
		t.Parallel()
		_, ok := manager.Station("zmdfh1U3G6")
		assert.True(t, ok)
		manager.DeleteStation("zmdfh1U3G6")
		_, ok = manager.Station("zmdfh1U3G6")
		assert.False(t, ok)
	})
	t.Run("delete non existing station", func(t *testing.T) {
		t.Parallel()
		_, ok := manager.Station("X")
		assert.False(t, ok)
		manager.DeleteStation("X")
		_, ok = manager.Station("X")
		assert.False(t, ok)
	})
}

func TestManager_SaveLine(t *testing.T) {
	manager, err := LoadFile(filepath.Join("../testdata/wuerzburg.json"))
	require.NoError(t, err)
	t.Run("save new line", func(t *testing.T) {
		t.Parallel()
		_, ok := manager.Line("randomKey")
		assert.False(t, ok)
		line := manager.SaveLine(Line{
			Stops: []string{"zmdfh1U3G6", "ZcA9vNW4Da"},
			Path:  nil,
			Name:  "Line A: New",
			Color: "blue",
			Key:   "randomKey",
		})
		assert.Equal(t, "randomKey", line.Key)
		assert.Equal(t, 2, len(line.Stops))
		_, ok = manager.Line("randomKey")
		assert.True(t, ok)
		stations := line.Stations()
		assert.Equal(t, "Belvedere", stations[0].Name)
		assert.Equal(t, "Brunnenstraße", stations[1].Name)
	})
	t.Run("save line with empty key", func(t *testing.T) {
		t.Parallel()
		line := manager.SaveLine(Line{
			Stops: []string{"zmdfh1U3G6", "ZcA9vNW4Da"},
			Path:  nil,
			Name:  "Line A: New",
			Color: "blue",
			Key:   "",
		})
		assert.NotEmpty(t, line.Key)
		assert.Equal(t, 2, len(line.Stops))
		_, ok := manager.Line(line.Key)
		assert.True(t, ok)
		stations := line.Stations()
		assert.Equal(t, "Belvedere", stations[0].Name)
		assert.Equal(t, "Brunnenstraße", stations[1].Name)
	})
	t.Run("panic if stop not found", func(t *testing.T) {
		t.Parallel()
		assert.PanicsWithValue(t, "no stop with name \"any stop\" exists", func() {
			manager.SaveLine(Line{
				Stops: []string{"zmdfh1U3G6", "any stop"},
			})
		})
	})
}

func TestManager_SaveStation(t *testing.T) {
	manager, err := LoadFile(filepath.Join("../testdata/wuerzburg.json"))
	require.NoError(t, err)
	t.Run("save new station", func(t *testing.T) {
		t.Parallel()
		_, ok := manager.Station("randomKey")
		assert.False(t, ok)
		station := manager.SaveStation(Station{
			Key:  "randomKey",
			Name: "Court Street",
			Lat:  10,
			Lng:  20,
		})
		assert.Equal(t, "randomKey", station.Key)
		assert.Equal(t, "Court Street", station.Name)
		_, ok = manager.Station("randomKey")
		assert.True(t, ok)
	})
	t.Run("save line with empty key", func(t *testing.T) {
		t.Parallel()
		station := manager.SaveStation(Station{
			Name: "Court Street",
			Lat:  10,
			Lng:  20,
		})
		assert.NotEmpty(t, station.Key)
		assert.Equal(t, "Court Street", station.Name)
		_, ok := manager.Station(station.Key)
		assert.True(t, ok)
	})
}

func TestStation_Lines(t *testing.T) {
	t.Parallel()
	manager, err := LoadFile(filepath.Join("../testdata/wuerzburg.json"))
	require.NoError(t, err)

	station, ok := manager.Station("jubhF5kI2k")
	assert.True(t, ok)
	lines := station.Lines()
	assert.Equal(t, 6, len(lines))
	names := make([]string, 0, len(lines))
	for _, line := range lines {
		names = append(names, line.Name)
	}
	assert.Equal(t, "Linie 28: Busbahnhof → Mönchberg,Linie 28: Mönchberg → Busbahnhof,Linie 29: Busbahnhof → Hubland Nord,Linie 29: Campus Nord → Busbahnhof,Linie 214: Busbahnhof → Hubland,Linie 214: Hubland → Busbahnhof", strings.Join(names, ","))
}

func TestLine_Stations(t *testing.T) {
	manager, err := LoadFile(filepath.Join("../testdata/wuerzburg.json"))
	require.NoError(t, err)

	stations := manager.Stations()
	assert.Equal(t, 310, len(stations))
}

func TestManager_Lines(t *testing.T) {
	manager, err := LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	require.NoError(t, err)
	lines := manager.Lines()
	assert.Equal(t, 36, len(lines))
}

func TestManager_SaveTimetable(t *testing.T) {
	manager, err := LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	require.NoError(t, err)
	t.Run("without key should create new", func(t *testing.T) {
		count := len(manager.timetables)
		timetable := manager.SaveTimetable(Timetable{})
		assert.NotEmpty(t, timetable.Key)
		assert.Equal(t, count+1, len(manager.timetables))
		_, ok := manager.Timetable(timetable.Key)
		assert.True(t, ok)
		assert.NotNil(t, timetable.manager)
	})
	t.Run("without existing key should save nonetheless", func(t *testing.T) {
		count := len(manager.timetables)
		timetable := manager.SaveTimetable(Timetable{Key: "arbitrary key"})
		assert.Equal(t, "arbitrary key", timetable.Key)
		assert.Equal(t, count+1, len(manager.Timetables()))
		_, ok := manager.Timetable(timetable.Key)
		assert.True(t, ok)

		timetable.Name = "Timetable for test"
		saved, _ := manager.Timetable(timetable.Key)
		assert.Empty(t, saved.Name)
		saved = manager.SaveTimetable(timetable)
		assert.Equal(t, count+1, len(manager.Timetables()))
		assert.Equal(t, "Timetable for test", saved.Name)
		saved, _ = manager.Timetable(timetable.Key)
		assert.Equal(t, "Timetable for test", saved.Name)
	})
}

func TestManager_Export(t *testing.T) {
	manager, err := LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	require.NoError(t, err)
	result := manager.Export()
	assert.Equal(t, 310, len(result.Stations))
	assert.Equal(t, persistence.Station{
		Key:        "Z4Dg3WrM6c",
		Name:       "Blosenbergpfad",
		LatLng:     "cuunHatr{@",
		IsWaypoint: false,
	}, result.Stations[44])
	assert.Equal(t, 36, len(result.Lines))
	assert.Equal(t, "Linie 16: Stadtmitte → Heidingsfeld", result.Lines[14].Name)
	assert.Equal(t, persistence.MetaCoord{
		Dist: 6.319016,
		Dur:  2.3,
		Stop: false,
	}, result.Lines[14].Path.Meta[6])
	geo, _, err := polyline2.DecodeCoords([]byte(result.Lines[14].Path.Geometry))
	assert.NotEmpty(t, geo)
	assert.NoError(t, err)
	assert.Equal(t, 327, len(geo))
	assert.Equal(t, 17, len(result.Lines[15].Stops))
	assert.Equal(t, "cZNY7z6o_t", result.Lines[15].Stops[5])
	assert.Equal(t, "#dace33", result.Lines[14].Color)
	assert.Equal(t, "S9BbG58UKu", result.Lines[14].Key)
}
