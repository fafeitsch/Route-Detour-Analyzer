package rpc

import (
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"path/filepath"
	"testing"
)

func TestLineHandler_CreateLine(t *testing.T) {
	manager, _ := scenario.LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	count := len(manager.Lines())
	handler := lineHandler{Manager: manager}
	lineObj, err := handler.createLine(nil)
	require.NoError(t, err)
	var line types.Line
	err = json.Unmarshal(lineObj, &line)
	assert.Equal(t, "", line.Name)
	assert.NotEmpty(t, line.Key)
	assert.Equal(t, 0, len(line.Stops))
	assert.Equal(t, 0, len(line.Stations))
	assert.Equal(t, "", line.Color)
	assert.Equal(t, 0, len(line.Path))
	assert.Equal(t, count+1, len(manager.Lines()))
	_, ok := manager.Line(line.Key)
	assert.True(t, ok)
}

func TestLineHandler_SaveLine(t *testing.T) {
	manager, _ := scenario.LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	count := len(manager.Lines())
	handler := lineHandler{Manager: manager}
	t.Run("success", func(t *testing.T) {
		line29, _ := manager.Line("7BNJI4rUT6")
		require.Equal(t, "Linie 29: Busbahnhof → Hubland Nord", line29.Name)
		require.Equal(t, 15, len(line29.Stops))
		require.Equal(t, 232, len(line29.Path))
		require.Equal(t, "#c233da", line29.Color)
		dur := []float64{45, 0}
		dist := []float64{32, 0}
		changedLine := types.Line{
			Stops: []string{"ORxFvp_ICt", "7kOE25kjY6", "zmdfh1U3G6"},
			Path: []types.Waypoint{
				{
					Lat:  0,
					Lng:  1,
					Dur:  &dur[0],
					Dist: &dist[0],
					Stop: true,
				},
				{Lat: 1, Lng: 2, Dur: &dur[1], Dist: &dist[1]},
			},
			Name:  "Line A → Testland",
			Color: "yellow",
			Key:   "7BNJI4rUT6",
		}
		_, err := handler.saveLine(mustMarshal(changedLine))
		require.NoError(t, err)
		assert.Equal(t, count, len(manager.Lines()))
		createdLine, _ := manager.Line("7BNJI4rUT6")
		assert.Equal(t, "Line A → Testland", createdLine.Name)
		assert.Equal(t, 3, len(createdLine.Stops))
		assert.Equal(t, "zmdfh1U3G6", createdLine.Stops[2])
		assert.Equal(t, "yellow", createdLine.Color)
		assert.Equal(t, 2, len(createdLine.Path))
		assert.Equal(t, scenario.Waypoint{
			Lat:  0,
			Lng:  1,
			Dur:  45,
			Dist: 32,
			Stop: true,
		}, createdLine.Path[0])
		assert.Equal(t, scenario.Waypoint{
			Lat:  1,
			Lng:  2,
			Dur:  0,
			Dist: 0,
			Stop: false,
		}, createdLine.Path[1])
	})
	t.Run("stop not found", func(t *testing.T) {
		changedLine := types.Line{
			Key:   "7BNJI4rUT6",
			Stops: []string{"ORxFvp_ICt", "does not exist", "zmdfh1U3G6"},
		}
		result, err := handler.saveLine(mustMarshal(changedLine))
		assert.Nil(t, result)
		assert.EqualError(t, err, "a station with key \"does not exist\" does not exist")
	})
}

func TestLineHandler_QueryLine(t *testing.T) {
	manager, _ := scenario.LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	handler := lineHandler{Manager: manager}
	t.Run("success", func(t *testing.T) {
		request := types.LineIdentifier{Key: "7BNJI4rUT6"}
		result, err := handler.queryLine(mustMarshal(request))
		assert.NoError(t, err)
		var line types.Line
		err = json.Unmarshal(result, &line)
		assert.NoError(t, err)
		assert.Equal(t, "Linie 29: Busbahnhof → Hubland Nord", line.Name)
		assert.Equal(t, "7BNJI4rUT6", line.Key)
		assert.Equal(t, "Barbarossaplatz", line.Stations[2].Name)
		assert.False(t, line.Stations[2].IsWaypoint)
		assert.Equal(t, 49.79745, line.Stations[2].Lat)
		assert.Equal(t, 9.93503, line.Stations[2].Lng)
		assert.Equal(t, 15, len(line.Stations))
		assert.Equal(t, 232, len(line.Path))
		assert.Equal(t, 15, len(line.Stops))
		zero := 0.0
		assert.Equal(t, types.Waypoint{
			Lat:  49.789489999999894,
			Lng:  9.980310000000014,
			Dist: &zero,
			Dur:  &zero,
			Stop: true,
		}, line.Path[231])
		assert.Equal(t, "#c233da", line.Color)
	})
	t.Run("line not found", func(t *testing.T) {
		request := types.LineIdentifier{Key: "not found"}
		msg, _ := json.Marshal(request)
		result, err := handler.queryLine(msg)
		assert.Nil(t, result)
		assert.EqualError(t, err, "no line with name \"not found\" found")
	})
}

func TestLineHandler_GetLinePaths(t *testing.T) {
	manager, _ := scenario.LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	handler := lineHandler{Manager: manager}

	response, err := handler.getLinePaths(nil)
	assert.Nil(t, err)
	var lines []types.Line
	err = json.Unmarshal(response, &lines)
	assert.Nil(t, err)
	assert.Equal(t, 36, len(lines))
	assert.Equal(t, "Linie 8w: Zollhaus → Waldfriedhof", lines[5].Name)
	assert.Nil(t, lines[5].Stations)
	assert.Nil(t, lines[5].Stops)
	assert.Equal(t, "#179e20", lines[5].Color)
	assert.Equal(t, types.Waypoint{
		Lat:  49.77382999999999,
		Lng:  9.926659999999998,
		Dist: nil,
		Dur:  nil,
		Stop: false,
	}, lines[5].Path[7])
	assert.Equal(t, 115, len(lines[5].Path))
}

func TestLineHandler_DeleteLine(t *testing.T) {
	manager, _ := scenario.LoadFile(filepath.Join("..", "testdata", "wuerzburg.json"))
	handler := lineHandler{Manager: manager}
	count := len(manager.Lines())
	t.Run("success", func(t *testing.T) {
		request := types.LineIdentifier{Key: "7BNJI4rUT6"}
		result, err := handler.deleteLine(mustMarshal(request))
		assert.NoError(t, err)
		assert.Nil(t, result)
		assert.Equal(t, count-1, len(manager.Lines()))
		_, ok := manager.Line("7BNJI4rUT6")
		assert.False(t, ok)
	})
}
