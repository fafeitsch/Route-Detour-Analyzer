package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/osrmutils"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
)

type stationHandler struct {
	manager *scenario.Manager
	osrmUrl string
	mapper  mapper.Mapper
}

func newStationHandler(manager *scenario.Manager, osrmUrl string) *stationHandler {
	return &stationHandler{
		manager: manager,
		osrmUrl: osrmUrl,
		mapper:  mapper.New(manager),
	}
}

func (s *stationHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getStations": {
			description: "Returns a list of all stations.",
			output:      reflect.TypeOf([]types.Station{}),
			method:      s.queryStations,
		},
		"updateStations": {
			description: "Updates all stations in the list. Stations with empty key will be created. Stations with" +
				"an existing key will be updated. If the list contains a station with non-existing, non-empty key, an error is returned.",
			input:          reflect.TypeOf([]types.Station{}),
			method:         s.UpdateStations,
			persistChanged: true,
		},
	}
}

func (s *stationHandler) queryStations(params json.RawMessage) (json.RawMessage, error) {
	var request map[string]bool
	_ = json.Unmarshal(params, &request)
	stations := s.manager.Stations()
	result := make([]types.Station, 0, len(stations))
	for _, station := range stations {
		expand, ok := request["includeLines"]
		converted := s.mapper.ToDtoStation(station, expand && ok)
		result = append(result, converted)
	}
	sort.Slice(result, func(i, j int) bool {
		if result[i].Name == result[j].Name {
			return result[i].Key < result[j].Key
		}
		return result[i].Name < result[j].Name
	})
	return mustMarshal(result), nil
}

func (s *stationHandler) UpdateStations(params json.RawMessage) (json.RawMessage, error) {
	var request types.StationUpdate
	_ = json.Unmarshal(params, &request)
	for _, deleted := range request.Deleted {
		station, ok := s.manager.Station(deleted)
		if !ok {
			return nil, fmt.Errorf("could not find station to delete with key \"%s\"", deleted)
		}
		if len(station.Lines()) > 0 {
			return nil, fmt.Errorf("could not delete station \"%s\" because it's still used by a line", deleted)
		}
	}
	affectedLines := make(map[string]string)
	for _, station := range request.ChangedOrAdded {
		domainStation := scenario.Station{
			Key:        station.Key,
			Name:       station.Name,
			Lat:        station.Lat,
			Lng:        station.Lng,
			IsWaypoint: station.IsWaypoint,
		}
		domainStation = s.manager.SaveStation(domainStation)
		for _, line := range domainStation.Lines() {
			affectedLines[line.Key] = line.Key
		}
	}
	for _, deletion := range request.Deleted {
		s.manager.DeleteStation(deletion)
	}
	for _, lineKey := range affectedLines {
		line, _ := s.manager.Line(lineKey)
		stations := line.Stations()
		latlngs := make([]types.LatLng, 0, len(stations))
		for _, station := range stations {
			latlngs = append(latlngs, types.LatLng{
				Lat: station.Lat,
				Lng: station.Lng,
			})
		}
		waypoints, err := osrmutils.QueryRoute(s.osrmUrl, latlngs)
		if err != nil {
			return nil, fmt.Errorf("could not update the route line \"%s\" → the line's route is deprecated now", line.Key)
		}
		line.Path = s.mapper.ToVoWaypoints(waypoints)
		s.manager.SaveLine(line)
	}
	return nil, nil
}
