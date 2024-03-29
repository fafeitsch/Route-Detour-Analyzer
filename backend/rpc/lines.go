package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"reflect"
)

type lineHandler struct {
	manager *scenario.Manager
	osrmUrl string
}

func newLineHandler(manager *scenario.Manager, osrmUrl string) *lineHandler {
	return &lineHandler{
		manager: manager,
		osrmUrl: osrmUrl,
	}
}

func (h *lineHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getLine": {
			description: "Finds a line with the given identifier (only the key is used). Expands the stations and returns the line.",
			input:       reflect.TypeOf(types.LineIdentifier{}),
			output:      reflect.TypeOf(types.Line{}),
			method:      h.queryLine,
		},
		"getLines": {
			description: "Returns all lines, without their paths",
			output:      reflect.TypeOf([]types.Line{}),
			method:      h.getLines,
		},
		"saveLine": {
			description: "Saves a line. " +
				"If the key already exists, the line will be overwritten. " +
				"If the key is empty, a new line will be created. " +
				"Ignores the stations field of the line. The stops referenced in the stops list must exist.",
			input:          reflect.TypeOf(types.Line{}),
			output:         reflect.TypeOf(types.Line{}),
			method:         h.saveLine,
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
	line, ok := h.manager.Line(request.Key)
	if !ok {
		return nil, fmt.Errorf("no line with name \"%s\" found", request.Key)
	}
	return mustMarshal(mapper.ToDtoLine(line)), nil
}

func (h *lineHandler) saveLine(params json.RawMessage) (json.RawMessage, error) {
	var line types.Line
	_ = json.Unmarshal(params, &line)
	for _, stop := range line.Stops {
		if _, ok := h.manager.Station(stop); !ok {
			return nil, fmt.Errorf("a station with key \"%s\" does not exist", stop)
		}
	}
	result := h.manager.SaveLine(mapper.ToVoLine(line))
	return mustMarshal(mapper.ToDtoLine(result)), nil
}

func (h *lineHandler) deleteLine(params json.RawMessage) (json.RawMessage, error) {
	var request types.LineIdentifier
	_ = json.Unmarshal(params, &request)
	h.manager.DeleteLine(request.Key)
	return nil, nil
}

func (h *lineHandler) getLinePaths(params json.RawMessage) (json.RawMessage, error) {
	lines := h.manager.Lines()
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

func (h *lineHandler) getLines(params json.RawMessage) (json.RawMessage, error) {
	lines := h.manager.Lines()
	result := make([]types.Line, 0, len(lines))
	for _, line := range lines {
		mapped := mapper.ToDtoLine(line)
		mapped.Path = nil
		result = append(result, mapped)
	}
	return mustMarshal(result), nil
}
