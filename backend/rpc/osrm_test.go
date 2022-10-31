package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/osrmutils"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"net/url"
	"path/filepath"
	"regexp"
	"testing"
)

func TestOsrmHandler_QueryRoute(t *testing.T) {
	osrmServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.RequestURI == "/route/v1/driving/polyline%28_qo%5D_%7Brc@_seK_seK%29?overview=full&annotations=true" {
			route := osrmutils.RouteResponse{
				Routes: []osrmutils.Route{
					{
						Geometry: "k|}nHq_q{@]f@IJ??",
						Legs: []osrmutils.Leg{
							{
								Annotation: osrmutils.Annotation{
									Distance: []float64{
										22.283466,
										6.688107,
									}, Duration: []float64{2.1, 0.6},
								},
							},
							{
								Annotation: osrmutils.Annotation{
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
	handler := newOsrmHandler(nil, osrmServer.URL)

	t.Run("happy path", func(t *testing.T) {
		body, _ := json.Marshal([]types.LatLng{
			{Lat: 5, Lng: 6},
			{Lat: 7, Lng: 8},
		})
		raw, err := handler.queryRoute(body)
		require.NoError(t, err)
		var response []scenario.Waypoint
		_ = json.Unmarshal(raw, &response)
		assert.NoError(t, err)
		assert.Equal(t, 3, len(response), "there should be four waypoints in the response")
		assert.Equal(t, scenario.Waypoint{
			Dist: 22.283466,
			Dur:  2.1,
			Lat:  49.80182,
			Lng:  9.92265,
			Stop: true,
		}, response[0], "first domain.Waypoint")
		assert.Equal(t, scenario.Waypoint{
			Dist: 6.688107,
			Dur:  0.6,
			Lat:  49.80197,
			Lng:  9.922450000000001,
			Stop: false,
		}, response[1], "second domain.Waypoint")
		assert.Equal(t, scenario.Waypoint{
			Dist: 0.0,
			Dur:  0.0,
			Lat:  49.80202,
			Lng:  9.922390000000002,
			Stop: true,
		}, response[2], "third domain.Waypoint")
	})

	t.Run("OSRM answer not parsable", func(t *testing.T) {
		body, _ := json.Marshal([]types.LatLng{
			{Lat: 5, Lng: 6},
			{Lat: 7, Lng: 9},
		})
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
	handler := newOsrmHandler(nil, osrmServer.URL)

	t.Run("happy path", func(t *testing.T) {
		body, _ := json.Marshal(types.LatLng{Lat: 43, Lng: 42})
		raw, _ := handler.queryAddress(body)
		var response struct {
			Name string `json:"name"`
		}
		err := json.Unmarshal(raw, &response)
		assert.NoError(t, err)
		assert.Equal(t, "Court Street", response.Name)
	})

	t.Run("OSRM problem", func(t *testing.T) {
		body, _ := json.Marshal(types.LatLng{Lat: 5, Lng: 6})
		_, err := handler.queryAddress(body)
		assert.EqualError(t, err, "could not parse response from osrm: EOF")
	})
}

func TestOsrmHandler_computeDetour(t *testing.T) {
	manager, _ := scenario.LoadScenario(filepath.Join("..", "testdata"))
	mockRouteLengths := map[string]float64{
		"s_unHg~z{@scFhgF": 6210.972846000002,
		"s_unHg~z{@wjFzcF": 6359.7029760000005,
		"s_unHg~z{@kqFptF": 6625.943509999999,
		"s_unHg~z{@ewFlfG": 6882.402342999999,
		"s_unHg~z{@a`GfdG": 7074.382461,
		"smunH{dz{@w|EnjE": 5974.491321,
		"smunH{dz{@kcFd{E": 6240.731854999999,
		"smunH{dz{@eiF`mF": 6497.190687999999,
		"smunH{dz{@arFzjF": 6689.170806,
		"gqunHg|y{@w_FprE": 6122.388761999999,
		"gqunHg|y{@qeFldF": 6378.847594999998,
		"gqunHg|y{@mnFfbF": 6570.827713,
		"o~unH}rx{@ixEb{D": 5952.126803999997,
		"o~unH}rx{@eaF|xD": 6144.106921999997,
		"sbvnHsxw{@a}Er~C": 5874.396053999997,
	}
	polylineMatcher := regexp.MustCompile("polyline\\(([^)]+)\\)")
	osrmServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		uri, _ := url.QueryUnescape(r.RequestURI)
		geometry := polylineMatcher.FindStringSubmatch(uri)[1]
		distance, ok := mockRouteLengths[geometry]
		if !ok {
			_, _ = w.Write([]byte("polyline not found"))
			return
		}
		route := osrmutils.RouteResponse{
			Routes: []osrmutils.Route{
				{
					Geometry: geometry,
					Legs: []osrmutils.Leg{
						{
							Annotation: osrmutils.Annotation{
								Distance: []float64{distance},
								Duration: []float64{0},
							},
						},
					},
				},
			},
		}
		_ = json.NewEncoder(w).Encode(route)
	}))
	defer osrmServer.Close()

	handler := newOsrmHandler(manager, osrmServer.URL)

	t.Run("happy path", func(t *testing.T) {
		existingLine, _ := manager.Line("t2A39YXN2D")
		line := mapper.ToDtoLine(existingLine)
		request := types.DetourRequest{
			Stations: line.Stations,
			Path:     line.Path,
			Cap:      4,
		}
		result, err := handler.computeDetour(mustMarshal(request))
		require.NoError(t, err)
		var response types.DetourResponse
		_ = json.Unmarshal(result, &response)
		require.Equal(t, types.DetourResponse{
			AverageDetour: 1.497322385271123,
			BiggestDetour: types.Detour{
				Absolute: 3176.5483450000092,
				Relative: 1.5316851551586694,
				Source:   1,
				Target:   24,
			},
			MedianDetour: types.Detour{
				Absolute: 3176.5484670000096,
				Relative: 1.4994806328200458,
				Source:   0,
				Target:   24,
			},
			SmallestDetour: types.Detour{
				Absolute: 3207.901361000014,
				Relative: 1.4534531994396245,
				Source:   0,
				Target:   27,
			},
		}, response)
	})

	t.Run("unable to retrieve osrm data", func(t *testing.T) {
		existingLine, _ := manager.Line("S9BbG58UKu")
		line := mapper.ToDtoLine(existingLine)
		request := types.DetourRequest{
			Stations: line.Stations,
			Path:     line.Path,
			Cap:      4,
		}
		_, err := handler.computeDetour(mustMarshal(request))
		require.EqualError(t, err, "could not query detour: could not parse response from osrm: invalid character 'p' looking for beginning of value")
	})

	t.Run("empty result", func(t *testing.T) {
		request := types.DetourRequest{
			Cap: 0,
		}
		response, err := handler.computeDetour(mustMarshal(request))
		require.NoError(t, err)
		var detour types.DetourResponse
		_ = json.Unmarshal(response, &detour)
		assert.True(t, detour.EmptyResult)
	})
}
