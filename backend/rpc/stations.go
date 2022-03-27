package rpc

import (
	"backend/scenario"
	"encoding/json"
	"fmt"
	"reflect"
	"sort"
)

type stationHandler struct {
	Manager *scenario.Manager
	OsrmUrl string
}

func (s *stationHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getStations": {
			description: "Returns a list of all stations.",
			output:      reflect.TypeOf([]Station{}),
			method:      s.queryStations,
		},
		"updateStations": {
			description: "Updates all stations in the list. Stations with empty key will be created. Stations with" +
				"an existing key will be updated. If the list contains a station with non-existing, non-empty key, an error is returned.",
			input:          reflect.TypeOf([]Station{}),
			method:         s.UpdateStations,
			persistChanged: true,
		},
	}
}

func (s *stationHandler) queryStations(params json.RawMessage) (json.RawMessage, error) {
	var request map[string]bool
	if params != nil {
		err := json.Unmarshal(params, &request)
		if err != nil {
			return nil, fmt.Errorf("could not parse request: %v", err)
		}
	}
	stations := s.Manager.Stations()
	result := make([]Station, 0, len(stations))
	for _, station := range stations {
		var convertedLines []LineIdentifier
		if expand, ok := request["includeLines"]; expand && ok {
			lines := station.Lines()
			convertedLines = make([]LineIdentifier, 0, len(lines))
			for _, line := range lines {
				convertedLines = append(convertedLines, LineIdentifier{
					Key:  line.Key,
					Name: line.Name,
				})
			}
		}
		result = append(result, Station{
			Key:        station.Key,
			Name:       station.Name,
			Lat:        station.Lat,
			Lng:        station.Lng,
			IsWaypoint: station.IsWaypoint,
			Lines:      convertedLines,
		})
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
	var request StationUpdate
	err := json.Unmarshal(params, &request)
	if err != nil {
		return nil, fmt.Errorf("could not parse station update: %v", err)
	}
	for _, deleted := range request.Deleted {
		station, ok := s.Manager.Station(deleted)
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
		domainStation = s.Manager.SaveStation(domainStation)
		for _, line := range domainStation.Lines() {
			affectedLines[line.Key] = line.Key
		}
	}
	for _, deletion := range request.Deleted {
		s.Manager.DeleteStation(deletion)
	}
	for _, lineKey := range affectedLines {
		line, _ := s.Manager.Line(lineKey)
		stations := line.Stations()
		latlngs := make([]LatLng, 0, len(stations))
		for _, station := range stations {
			latlngs = append(latlngs, LatLng{
				Lat: station.Lat,
				Lng: station.Lng,
			})
		}
		waypoints, err := QueryRoute(s.OsrmUrl, latlngs)
		if err != nil {
			return nil, fmt.Errorf("could not update the route line \"%s\" → the line's route is deprecated now", line.Key)
		}
		line.Path = waypoints
		s.Manager.SaveLine(line)
	}
	return nil, nil
}
