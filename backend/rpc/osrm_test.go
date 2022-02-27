package rpc

import (
	"backend/persistence"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestOsrmHandler_QueryRoute(t *testing.T) {
	osrmServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.RequestURI == "/route/v1/driving/polyline%28_qo%5D_%7Brc@_seK_seK%29?overview=full&annotations=true" {
			route := RouteResponse{Routes: []Route{{Geometry: "k|}nHq_q{@]f@IJ??",
				Legs: []Leg{
					{Annotation: Annotation{Distance: []float64{22.283466, 6.688107}, Duration: []float64{2.1, 0.6}}},
					{Annotation: Annotation{Distance: []float64{0}, Duration: []float64{0}}}}}}}
			_ = json.NewEncoder(w).Encode(route)
		}
	}))
	defer osrmServer.Close()
	handler := osrmHandler{Url: osrmServer.URL}

	t.Run("happy path", func(t *testing.T) {
		body, _ := json.Marshal([]LatLng{{Lat: 5, Lng: 6}, {Lat: 7, Lng: 8}})
		raw, err := handler.queryRoute(body)
		require.NoError(t, err)
		var response []persistence.Waypoint
		_ = json.Unmarshal(raw, &response)
		assert.NoError(t, err)
		assert.Equal(t, 3, len(response), "there should be four waypoints in the response")
		assert.Equal(t, persistence.Waypoint{Dist: 22.283466, Dur: 2.1, Lat: 49.80182, Lng: 9.92265, Stop: true}, response[0], "first domain.Waypoint")
		assert.Equal(t, persistence.Waypoint{Dist: 6.688107, Dur: 0.6, Lat: 49.80197, Lng: 9.922450000000001, Stop: false}, response[1], "second domain.Waypoint")
		assert.Equal(t, persistence.Waypoint{Dist: 0.0, Dur: 0.0, Lat: 49.80202, Lng: 9.922390000000002, Stop: true}, response[2], "third domain.Waypoint")
	})

	t.Run("invalid request", func(t *testing.T) {
		params := []byte("anything but json")
		_, err := handler.queryRoute(params)
		assert.EqualError(t, err, "could not understand lat/lng request: invalid character 'a' looking for beginning of value")
	})

	t.Run("OSRM not found", func(t *testing.T) {
		handler.Url = "anything"
		defer func() { handler.Url = osrmServer.URL }()
		body, _ := json.Marshal([]LatLng{{Lat: 5, Lng: 6}, {Lat: 7, Lng: 8}})
		_, err := handler.queryRoute(body)
		assert.EqualError(t, err, "could not query OSRM route: Get \"anything/route/v1/driving/polyline%28_qo%5D_%7Brc@_seK_seK%29?overview=full&annotations=true\": unsupported protocol scheme \"\"")
	})

	t.Run("OSRM answer not parsable", func(t *testing.T) {
		body, _ := json.Marshal([]LatLng{{Lat: 5, Lng: 6}, {Lat: 7, Lng: 9}})
		_, err := handler.queryRoute(body)
		assert.EqualError(t, err, "could not parse response from osrm: EOF")
	})
}

func TestOsrmHandler_QueryAddress(t *testing.T) {
	osrmServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.RequestURI == "/nearest/v1/driving/42.000000,43.000000.json?number=1" {
			address := struct {
				Waypoints []struct{ Name string }
			}{Waypoints: []struct{ Name string }{{Name: "Court Street"}}}
			_ = json.NewEncoder(w).Encode(address)
			return
		}
		if r.RequestURI == "/nearest/v1/driving/42.000000,52.000000.json?number=1" {
			address := struct {
				Waypoints []struct{ Name string }
			}{Waypoints: []struct{ Name string }{}}
			_ = json.NewEncoder(w).Encode(address)
		}
	}))
	defer osrmServer.Close()
	handler := osrmHandler{Url: osrmServer.URL}

	t.Run("happy path", func(t *testing.T) {
		body, _ := json.Marshal(LatLng{Lat: 43, Lng: 42})
		raw, _ := handler.queryAddress(body)
		var response struct {
			Name string `json:"name"`
		}
		err := json.Unmarshal(raw, &response)
		assert.NoError(t, err)
		assert.Equal(t, "Court Street", response.Name)
	})

	t.Run("happy path empty answer", func(t *testing.T) {
		body, _ := json.Marshal(LatLng{Lat: 52, Lng: 42})
		_, err := handler.queryAddress(body)
		var response struct {
			Name string `json:"name"`
		}
		assert.NoError(t, err)
		assert.Equal(t, "", response.Name)
	})

	t.Run("invalid request", func(t *testing.T) {
		body := []byte("no json")
		_, err := handler.queryAddress(body)
		assert.EqualError(t, err, "could not understand lat/lng request: invalid character 'o' in literal null (expecting 'u')")
	})

	t.Run("OSRM not found", func(t *testing.T) {
		handler.Url = "anything"
		defer func() { handler.Url = osrmServer.URL }()
		body, _ := json.Marshal(LatLng{Lat: 5, Lng: 6})
		_, err := handler.queryAddress(body)
		assert.EqualError(t, err, "could not query OSRM Route: Get \"anything/nearest/v1/driving/6.000000,5.000000.json?number=1\": unsupported protocol scheme \"\"")
	})

	t.Run("OSRM answer not parsable", func(t *testing.T) {
		body, _ := json.Marshal(LatLng{Lat: 5, Lng: 6})
		_, err := handler.queryAddress(body)
		assert.EqualError(t, err, "could not parse response from osrm: EOF")
	})
}
