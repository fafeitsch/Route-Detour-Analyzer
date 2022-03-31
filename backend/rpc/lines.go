package rpc

import (
	"backend/rpc/types"
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
			input:       reflect.TypeOf(types.LineIdentifier{}),
			output:      reflect.TypeOf(types.Line{}),
			method:      h.queryLine,
		},
		"saveLine": {
			description: "Saves a line. " +
				"If the key already exists, the line will be overwritten. " +
				"If the key is empty, a new line will be created. " +
				"Ignores the stations field of the line. The stops referenced in the stops list must exist.",
			input:          reflect.TypeOf(types.Line{}),
			method:         h.saveLine,
			persistChanged: true,
		},
		"createLine": {
			description:    `Creates an empty line and returns it.`,
			output:         reflect.TypeOf(types.Line{}),
			method:         h.createLine,
			persistChanged: true,
		},
		"deleteLine": {
			description:    "Deletes the line identified by the key in the identifier.",
			input:          reflect.TypeOf(types.LineIdentifier{}),
			method:         h.deleteLine,
			persistChanged: true,
		},
		"getLinePaths": {
			description: "Returns all lines with only the information needed to draw a line network onto a map." +
				"Stations and Stops as well es distances and durations between them are not included.",
			output: reflect.TypeOf([]types.Line{}),
			method: h.getLinePaths,
		},
	}
}

func (h *lineHandler) queryLine(params json.RawMessage) (json.RawMessage, error) {
	var request types.LineIdentifier
	_ = json.Unmarshal(params, &request)
	line, ok := h.Manager.Line(request.Key)
	if !ok {
		return nil, fmt.Errorf("no line with name \"%s\" found", request.Key)
	}
	return mustMarshal(mapToDtoLine(line)), nil
}

func (h *lineHandler) saveLine(params json.RawMessage) (json.RawMessage, error) {
	var line types.Line
	_ = json.Unmarshal(params, &line)
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
	result := types.Line{
		Stations: []types.Station{},
		Path:     []types.Waypoint{},
		Name:     line.Name,
		Color:    line.Color,
		Key:      line.Key,
	}
	return mustMarshal(result), nil
}

func (h *lineHandler) deleteLine(params json.RawMessage) (json.RawMessage, error) {
	var request types.LineIdentifier
	_ = json.Unmarshal(params, &request)
	h.Manager.DeleteLine(request.Key)
	return nil, nil
}

func (h *lineHandler) getLinePaths(params json.RawMessage) (json.RawMessage, error) {
	lines := h.Manager.Lines()
	paths := make([]types.Line, 0, len(lines))
	for _, line := range lines {
		waypoints := make([]types.Waypoint, 0, len(line.Path))
		for _, wp := range line.Path {
			waypoints = append(waypoints, types.Waypoint{
				Lat: wp.Lat,
				Lng: wp.Lng,
			})
		}
		paths = append(paths, types.Line{
			Name:  line.Name,
			Color: line.Color,
			Path:  waypoints,
			Key:   line.Key,
		})
	}
	return mustMarshal(paths), nil
}
