package rpc

import (
	"backend/scenario"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func TestStationHandler_QueryStations(t *testing.T) {
	manager, _ := scenario.New(filepath.Join("..", "testdata", "wuerzburg.json"))
	handler := stationHandler{Manager: manager}

	manager.SaveStation(scenario.Station{Key: "an unused station"})

	t.Run("include lines", func(t *testing.T) {
		request := map[string]bool{"includeLines": true}
		params, _ := json.Marshal(request)
		rawResult, _ := handler.queryStations(params)

		var result []Station
		_ = json.Unmarshal(rawResult, &result)
		assert.Equal(t, 311, len(result))
		station := result[72]
		assert.Equal(t, "erthalstraße3", station.Key)
		assert.Equal(t, "Erthalstraße", station.Name)
		assert.NotEqual(t, 0, station.Lat)
		assert.NotEqual(t, 0, station.Lng)
		assert.False(t, station.IsWaypoint)
		assert.Equal(t, 2, len(station.Lines))
		assert.Equal(t, "Linie 10: Sandering → Hubland", station.Lines[0].Name)
		assert.Equal(t, "gFsR_Qqj15", station.Lines[0].Key)
		assert.Equal(t, "Linie 34: Heidingsfeld → Lengfeld", station.Lines[1].Name)
	})
	t.Run("dont include lines", func(t *testing.T) {
		rawResult, _ := handler.queryStations(nil)

		var result []Station
		_ = json.Unmarshal(rawResult, &result)
		assert.Equal(t, 311, len(result))
		station := result[72]
		assert.Equal(t, "erthalstraße3", station.Key)
		assert.Equal(t, "Erthalstraße", station.Name)
		assert.NotEqual(t, 0, station.Lat)
		assert.NotEqual(t, 0, station.Lng)
		assert.False(t, station.IsWaypoint)
		assert.Nil(t, station.Lines)
	})
}

func TestStationHandler_UpdateStations(t *testing.T) {
	manager, _ := scenario.New(filepath.Join("..", "testdata", "wuerzburg.json"))
	handler := stationHandler{Manager: manager}

	t.Run("test unparsable request", func(t *testing.T) {
		request := json.RawMessage("test")
		_, err := handler.UpdateStations(request)
		assert.EqualError(t, err, "could not parse station update: invalid character 'e' in literal true (expecting 'r')")
	})

	t.Run("test unknown deleted station", func(t *testing.T) {
		request, _ := json.Marshal(StationUpdate{
			Deleted: []string{"not there"},
		})
		_, err := handler.UpdateStations(request)
		assert.EqualError(t, err, "could not find station to delete with key \"not there\"")
	})
	t.Run("test station still in use", func(t *testing.T) {
		request, _ := json.Marshal(StationUpdate{
			Deleted: []string{"barbarossaplatz"},
		})
		_, err := handler.UpdateStations(request)
		assert.EqualError(t, err, "could not delete station \"barbarossaplatz\" because it's still used by a line")
	})
	t.Run("should do nothing with empty input", func(t *testing.T) {
		request := json.RawMessage("{}")
		_, err := handler.UpdateStations(request)
		assert.NoError(t, err)
		assert.Equal(t, 310, len(manager.Stations()))
	})

	osrmCalled := 0
	osrmServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		route := RouteResponse{Routes: []Route{{Geometry: "k|}nHq_q{@]f@IJ??",
			Legs: []Leg{
				{Annotation: Annotation{Distance: []float64{22.283466, 6.688107}, Duration: []float64{2.1, 0.6}}},
				{Annotation: Annotation{Distance: []float64{0}, Duration: []float64{0}}}}}}}

		_ = json.NewEncoder(w).Encode(route)
		osrmCalled = osrmCalled + 1
	}))
	defer osrmServer.Close()
	handler.OsrmUrl = osrmServer.URL

	line29, _ := manager.Line("luhFjA1KKO")
	assert.Equal(t, "elferweg", line29.Stops[1])
	assert.Equal(t, 239, len(line29.Path))

	t.Run("should update and delete stations", func(t *testing.T) {
		manager.SaveStation(scenario.Station{Key: "ready to delete"})
		assert.Equal(t, 311, len(manager.Stations()))
		request := mustMarshal(StationUpdate{
			Deleted: []string{"ready to delete"},
			ChangedOrAdded: []Station{
				{
					Lat:        10,
					Lng:        20,
					Key:        "barbarossaplatz",
					Name:       "Glaskuppeldach",
					IsWaypoint: true,
				},
				{
					Lat:        40,
					Lng:        50,
					Name:       "Neustadt",
					IsWaypoint: true,
				},
			},
		})
		_, err := handler.UpdateStations(request)
		assert.NoError(t, err)
		assert.Equal(t, 7, osrmCalled)
		barbarossaPlatz, _ := manager.Station("barbarossaplatz")
		assert.Equal(t, 10.0, barbarossaPlatz.Lat)
		assert.Equal(t, 20.0, barbarossaPlatz.Lng)
		assert.Equal(t, "Glaskuppeldach", barbarossaPlatz.Name)
		assert.True(t, barbarossaPlatz.IsWaypoint)
		var neustadt scenario.Station
		for _, station := range manager.Stations() {
			if station.Name == "Neustadt" {
				neustadt = station
			}
		}
		assert.Equal(t, 40.0, neustadt.Lat)
		assert.Equal(t, 50.0, neustadt.Lng)
		assert.True(t, neustadt.IsWaypoint)
		assert.Equal(t, 311, len(manager.Stations()))
	})
}
