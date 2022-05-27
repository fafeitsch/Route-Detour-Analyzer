package scenario

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"path/filepath"
	"testing"
)

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

func TestManager_DeleteTimetable(t *testing.T) {
	manager := Empty()
	timetable := manager.SaveTimetable(Timetable{})
	assert.Equal(t, 1, len(manager.Timetables()))
	assert.NotEmpty(t, timetable.Key)
	manager.DeleteTimetable(timetable.Key)
	assert.Equal(t, 0, len(manager.Timetables()))
}

func TestTimetable_Stations(t *testing.T) {
	manager := Empty()
	a := manager.SaveStation(Station{Key: "a"})
	b := manager.SaveStation(Station{Key: "b"})
	timetable := manager.SaveTimetable(Timetable{StationKeys: []string{"a", "b", "c"}})
	stations := timetable.Stations()
	assert.Equal(t, []Station{a, b, {}}, stations)
}

func TestTimetable_Line(t *testing.T) {
	manager := Empty()
	line := manager.SaveLine(Line{Name: "Example Line"})
	timetable := manager.SaveTimetable(Timetable{LineKey: line.Key})
	got := timetable.Line()
	assert.Equal(t, line, got)
}
