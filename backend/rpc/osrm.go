package rpc

import (
	"backend/rpc/osrmutils"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"sort"
)

type osrmHandler struct {
	url     string
	manager *scenario.Manager
}

func newOsrmHandler(manager *scenario.Manager, url string) *osrmHandler {
	return &osrmHandler{
		url:     url,
		manager: manager,
	}
}

func (o *osrmHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"queryRoute": {
			description: "Queries the route connecting the given lat/lng pairs.",
			input:       reflect.TypeOf([]types.LatLng{}),
			output:      reflect.TypeOf([]types.Waypoint{}),
			method:      o.queryRoute,
		},
		"queryAddress": {
			description: "Queries the name of the nearest street of the given lat/lng pair.",
			input:       reflect.TypeOf(types.LatLng{}),
			output:      reflect.TypeOf(types.AddressResponse{}),
			method:      o.queryAddress,
		},
		"computeDetours": {
			description: "Computes the detours for a line identified by a key.",
			input:       reflect.TypeOf(types.DetourRequest{}),
			output:      reflect.TypeOf(types.DetourResponse{}),
			method:      o.computeDetour,
		},
	}
}

func (o *osrmHandler) queryRoute(params json.RawMessage) (json.RawMessage, error) {
	var request []types.LatLng
	_ = json.Unmarshal(params, &request)
	waypoints, err := osrmutils.QueryRoute(o.url, request)
	if err != nil {
		return nil, err
	}
	result, _ := json.Marshal(waypoints)
	return result, nil
}

func (o *osrmHandler) queryAddress(params json.RawMessage) (json.RawMessage, error) {
	var request types.LatLng
	_ = json.Unmarshal(params, &request)
	name, err := osrmutils.QueryAddress(o.url, request)
	if err != nil {
		return nil, err
	}
	response := struct {
		Name string `json:"name"`
	}{Name: name}
	result, _ := json.Marshal(response)
	return result, nil
}

func (o *osrmHandler) computeDetour(params json.RawMessage) (json.RawMessage, error) {
	var request types.DetourRequest
	_ = json.Unmarshal(params, &request)
	line, ok := o.manager.Line(request.Key)
	if !ok {
		return nil, fmt.Errorf("line with key \"%s\" not found", request.Key)
	}
	stations := line.Stations()
	pairs := osrmutils.CreateQueryPairs(stations, request.Cap)
	distances := osrmutils.DistanceBetweenStations(line.Path)
	detours := make([]types.Detour, 0, len(pairs))
	detourSum := 0.0
	for _, pair := range pairs {
		source := stations[pair[0]]
		target := stations[pair[1]]
		route, err := osrmutils.QueryRoute(o.url, []types.LatLng{
			{
				Lat: source.Lat,
				Lng: source.Lng,
			},
			{Lat: target.Lat, Lng: target.Lng},
		})
		if err != nil {
			return nil, fmt.Errorf("could not query detour: %v", err)
		}
		routeLength := 0.0
		for _, waypoint := range route {
			if waypoint.Dist == nil {
				continue
			}
			routeLength = routeLength + *waypoint.Dist
		}
		absolute := distances[pair[1]] - distances[pair[0]] - routeLength
		relative := (distances[pair[1]] - distances[pair[0]]) / routeLength
		detourSum = detourSum + relative
		detours = append(detours, types.Detour{
			Absolute: absolute,
			Relative: relative,
			Source:   pair[0],
			Target:   pair[1],
		})
	}
	sort.Slice(detours, func(i, j int) bool {
		return detours[i].Relative < detours[j].Relative
	})
	return mustMarshal(types.DetourResponse{
		AverageDetour:  detourSum / float64(len(detours)),
		BiggestDetour:  detours[len(detours)-1],
		MedianDetour:   detours[int(math.Floor(float64(len(detours)/2)))],
		SmallestDetour: detours[0],
	}), nil
}
