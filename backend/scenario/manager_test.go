package scenario

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"path/filepath"
	"strings"
	"sync"
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
	manager := Empty()
	t.Run("save new station", func(t *testing.T) {
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
		assert.Equal(t, 1, len(manager.Stations()))
		_, ok = manager.Station("randomKey")
		assert.True(t, ok)
	})
	t.Run("save line with empty key", func(t *testing.T) {
		station := manager.SaveStation(Station{
			Name: "Court Street",
			Lat:  10,
			Lng:  20,
		})
		assert.NotEmpty(t, station.Key)
		assert.Equal(t, 2, len(manager.Stations()))
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
	assert.Equal(t, 312, len(stations))
}

func TestManager_Lines(t *testing.T) {
	manager, err := LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	require.NoError(t, err)
	lines := manager.Lines()
	assert.Equal(t, 40, len(lines))
}

func TestEmpty(t *testing.T) {
	manager := Empty()
	assert.Equal(t, &Manager{
		filePath:   "",
		lines:      map[string]Line{},
		stations:   map[string]Station{},
		timetables: map[string]Timetable{},
		vehicles:   map[string]Vehicle{},
		mutex:      sync.RWMutex{},
		Center:     Center{Lat: 0, Lng: 0, Zoom: 0},
	}, manager)
}
