package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"reflect"
)

type timetableHandler struct {
	manager *scenario.Manager
	mapper  mapper.Mapper
}

func newTimetableHandler(manager *scenario.Manager) *timetableHandler {
	return &timetableHandler{
		manager: manager,
		mapper:  mapper.New(manager),
	}
}

func (t *timetableHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getTimetablesForLine": {
			description: "Returns a list of all timetables that are assigned to the given line." +
				"Will not return the tours of the timetable. Use getTimetable for that.",
			input:  reflect.TypeOf(types.LineIdentifier{}),
			output: reflect.TypeOf([]types.Timetable{}),
			method: t.getTimetablesForLine,
		},
		"saveTimetable": {
			description:    "Saves the given timetable.",
			input:          reflect.TypeOf(types.Timetable{}),
			output:         reflect.TypeOf(types.Timetable{}),
			method:         t.saveTimetable,
			persistChanged: true,
		},
		"deleteTimetable": {
			description:    "Deletes the timetable identified by the given key.",
			input:          reflect.TypeOf(types.Timetable{}),
			method:         t.deleteTimetable,
			persistChanged: true,
		},
		"getTimetable": {
			description: "Retrieves the timetable identified by the given key.",
			input:       reflect.TypeOf(types.Timetable{}),
			output:      reflect.TypeOf(types.Timetable{}),
			method:      t.getTimetable,
		},
	}
}

func (t *timetableHandler) getTimetablesForLine(params json.RawMessage) (json.RawMessage, error) {
	var line types.LineIdentifier
	_ = json.Unmarshal(params, &line)
	result := make([]types.Timetable, 0, 0)
	for _, tt := range t.manager.Timetables() {
		tt.Tours = nil
		if line.Key == *tt.Line {
			result = append(result, t.mapper.ToDtoTimetable(tt))
		}
	}
	return mustMarshal(result), nil
}

func (t *timetableHandler) saveTimetable(params json.RawMessage) (json.RawMessage, error) {
	var timetable types.Timetable
	_ = json.Unmarshal(params, &timetable)
	vo, err := t.mapper.ToVoTimetable(timetable)
	if err != nil {
		return nil, err
	}
	result := t.manager.SaveTimetable(vo)
	return mustMarshal(t.mapper.ToDtoTimetable(result)), nil
}

func (t *timetableHandler) deleteTimetable(params json.RawMessage) (json.RawMessage, error) {
	var timetable types.Timetable
	_ = json.Unmarshal(params, &timetable)
	t.manager.DeleteTimetable(timetable.Key)
	return nil, nil
}

func (t *timetableHandler) getTimetable(params json.RawMessage) (json.RawMessage, error) {
	var timetable types.Timetable
	_ = json.Unmarshal(params, &timetable)
	result, ok := t.manager.Timetable(timetable.Key)
	if !ok {
		return nil, fmt.Errorf("could not find timetable with key \"%s\"", timetable.Key)
	}
	return mustMarshal(t.mapper.ToDtoTimetable(result)), nil
}
