package osrmutils

import (
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestQueryRoute(t *testing.T) {
	osrmServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.RequestURI == "/route/v1/driving/polyline%28_qo%5D_%7Brc@_seK_seK%29?overview=full&annotations=true" {
			route := RouteResponse{
				Routes: []Route{
					{
						Geometry: "k|}nHq_q{@]f@IJ??",
						Legs: []Leg{
							{
								Annotation: Annotation{
									Distance: []float64{
										22.283466,
										6.688107,
									}, Duration: []float64{2.1, 0.6},
								},
							},
							{
								Annotation: Annotation{
									Distance: []float64{0},
									Duration: []float64{0},
								},
							},
						},
					},
				},
			}
			_ = json.NewEncoder(w).Encode(route)
		}
	}))
	defer osrmServer.Close()

	t.Run("happy path", func(t *testing.T) {
		response, err := QueryRoute(osrmServer.URL, []types.LatLng{
			{Lat: 5, Lng: 6},
			{Lat: 7, Lng: 8},
		})
		require.NoError(t, err)
		assert.Equal(t, 3, len(response), "there should be four waypoints in the response")
		dist1 := 22.283466
		dur1 := 2.1
		assert.Equal(t, types.Waypoint{
			Dist: &dist1,
			Dur:  &dur1,
			Lat:  49.80182,
			Lng:  9.92265,
			Stop: true,
		}, response[0], "first domain.Waypoint")
		dist2 := 6.688107
		dur2 := 0.6
		assert.Equal(t, types.Waypoint{
			Dist: &dist2,
			Dur:  &dur2,
			Lat:  49.80197,
			Lng:  9.922450000000001,
			Stop: false,
		}, response[1], "second domain.Waypoint")
		dist3 := 0.0
		assert.Equal(t, types.Waypoint{
			Dist: &dist3,
			Dur:  &dist3,
			Lat:  49.80202,
			Lng:  9.922390000000002,
			Stop: true,
		}, response[2], "third domain.Waypoint")
	})

	t.Run("OSRM not found", func(t *testing.T) {
		_, err := QueryRoute("anything", []types.LatLng{})
		assert.EqualError(t, err, "could not query OSRM route: Get \"anything/route/v1/driving/polyline()?overview=full&annotations=true\": unsupported protocol scheme \"\"")
	})

	t.Run("OSRM answer not parsable", func(t *testing.T) {
		_, err := QueryRoute(osrmServer.URL, []types.LatLng{
			{Lat: 5, Lng: 6},
			{Lat: 7, Lng: 9},
		})
		assert.EqualError(t, err, "could not parse response from osrm: EOF")
	})
}

func TestQueryAddress(t *testing.T) {
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

	t.Run("happy path", func(t *testing.T) {
		name, err := QueryAddress(osrmServer.URL, types.LatLng{Lat: 43, Lng: 42})
		assert.NoError(t, err)
		assert.Equal(t, "Court Street", name)
	})

	t.Run("happy path empty answer", func(t *testing.T) {
		name, err := QueryAddress(osrmServer.URL, types.LatLng{Lat: 52, Lng: 42})
		assert.NoError(t, err)
		assert.Equal(t, "", name)
	})

	t.Run("OSRM not found", func(t *testing.T) {
		_, err := QueryAddress("anything", types.LatLng{Lat: 5, Lng: 6})
		assert.EqualError(t, err, "could not query OSRM Route: Get \"anything/nearest/v1/driving/6.000000,5.000000.json?number=1\": unsupported protocol scheme \"\"")
	})

	t.Run("OSRM answer not parsable", func(t *testing.T) {
		_, err := QueryAddress(osrmServer.URL, types.LatLng{Lat: 5, Lng: 6})
		assert.EqualError(t, err, "could not parse response from osrm: EOF")
	})
}

func ExampleDistanceBetweenStations() {
	waypoints := []scenario.Waypoint{
		{Dist: 5, Stop: true},
		{Dist: 10},
		{Dist: 4},
		{Dist: 12, Stop: true},
		{Dist: 8},
		{Dist: 3, Stop: true},
		{Dist: 5},
		{Dist: 3},
		{Dist: 0, Stop: true},
	}
	wp := make([]types.Waypoint, 0, len(waypoints))
	for _, waypoint := range waypoints {
		waypoint := waypoint
		wp = append(wp, types.Waypoint{Dist: &waypoint.Dist, Stop: waypoint.Stop})
	}
	fmt.Printf("%v", DistanceBetweenStations(wp))
	// Output: [0 19 39 50]
}

func TestOsrmHandler_createQueryPairs(t *testing.T) {
	stations := []types.Station{
		{},
		{},
		{},
		{IsWaypoint: true},
		{},
		{},
		{IsWaypoint: true},
		{},
		{},
	}
	t.Run("complete tour only", func(t *testing.T) {
		result := CreateQueryPairs(stations, 0)
		assert.Equal(t, [][2]int{{0, 8}}, result)
	})
	t.Run("do not crash with negative cap", func(t *testing.T) {
		result := CreateQueryPairs(stations, -1)
		assert.Equal(t, [][2]int{}, result)
	})
	t.Run("normal cap", func(t *testing.T) {
		result := CreateQueryPairs(stations, 3)
		assert.Equal(t, [][2]int{
			{0, 4},
			{0, 5},
			{0, 7},
			{0, 8},
			{1, 5},
			{1, 7},
			{1, 8},
			{2, 7},
			{2, 8},
			{4, 8},
		}, result)
	})
}
