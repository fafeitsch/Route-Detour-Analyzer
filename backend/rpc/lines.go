package rpc

import (
	"backend/scenario"
	"encoding/json"
	"fmt"
	"reflect"
)

type lineHandler struct {
	Manager *scenario.Manager
	OsrmUrl string
}

func (h *lineHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getLine": {
			description: "Finds a line with the given identifier (only the key is used). Expands the stations and returns the line.",
			input:       reflect.TypeOf(LineIdentifier{}),
			output:      reflect.TypeOf(Line{}),
			method:      h.queryLine,
		},
		"saveLine": {
			description: "Saves a line. " +
				"If the key already exists, the line will be overwritten. " +
				"If the key is empty, a new line will be created. " +
				"Ignores the stations field of the line. The stops referenced in the stops list must exist.",
			input:  reflect.TypeOf(Line{}),
			method: h.saveLine,
		},
		"createLine": {
			description: `Creates an empty line and returns it.`,
			output:      reflect.TypeOf(Line{}),
			method:      h.createLine,
		},
		"deleteLine": {
			description: "Deletes the line identified by the key in the identifier.",
			input:       reflect.TypeOf(LineIdentifier{}),
			method:      h.deleteLine,
		},
		"getLinePaths": {
			description: "Returns all lines with only the information needed to draw a line network onto a map." +
				"Stations and Stops as well es distances and durations between them are not included.",
			output: reflect.TypeOf([]Line{}),
			method: h.getLinePaths,
		},
	}
}

func (h *lineHandler) queryLine(params json.RawMessage) (json.RawMessage, error) {
	var request LineIdentifier
	err := json.Unmarshal(params, &request)
	if err != nil {
		return nil, fmt.Errorf("could not parse request: %v", err)
	}
	line, ok := h.Manager.Line(request.Key)
	if !ok {
		return nil, fmt.Errorf("no line with name \"%s\" found", request.Key)
	}
	return mustMarshal(mapToDtoLine(line)), nil
}

func (h *lineHandler) saveLine(params json.RawMessage) (json.RawMessage, error) {
	var line Line
	err := json.Unmarshal(params, &line)
	if err != nil {
		return nil, fmt.Errorf("could not parse line: %v", err)
	}
	for _, stop := range line.Stops {
		if _, ok := h.Manager.Station(stop); !ok {
			return nil, fmt.Errorf("a station with key \"%s\" does not exist", stop)
		}
	}
	h.Manager.SaveLine(mapToVoLine(line))
	return nil, nil
}

func (h *lineHandler) createLine(params json.RawMessage) (json.RawMessage, error) {
	line := h.Manager.SaveLine(scenario.Line{})
	result := Line{
		Stations: []Station{},
		Path:     []Waypoint{},
		Name:     line.Name,
		Color:    line.Color,
		Key:      line.Key,
	}
	return mustMarshal(result), nil
}

func (h *lineHandler) deleteLine(params json.RawMessage) (json.RawMessage, error) {
	var request LineIdentifier
	err := json.Unmarshal(params, &request)
	if err != nil {
		return nil, fmt.Errorf("could not parse request: %v", err)
	}
	h.Manager.DeleteLine(request.Key)
	return nil, nil
}

func (h *lineHandler) getLinePaths(params json.RawMessage) (json.RawMessage, error) {
	lines := h.Manager.Lines()
	paths := make([]Line, 0, len(lines))
	for _, line := range lines {
		waypoints := make([]Waypoint, 0, len(line.Path))
		for _, wp := range line.Path {
			waypoints = append(waypoints, Waypoint{
				Lat: wp.Lat,
				Lng: wp.Lng,
			})
		}
		paths = append(paths, Line{
			Name:  line.Name,
			Color: line.Color,
			Path:  waypoints,
			Key:   line.Key,
		})
	}
	return mustMarshal(paths), nil
}
