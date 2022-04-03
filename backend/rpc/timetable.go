package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
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
			description:    "Returns a list of all timetables that are assigned to the given line.",
			input:          reflect.TypeOf(types.LineIdentifier{}),
			output:         reflect.TypeOf([]types.Timetable{}),
			method:         t.getTimetablesForLine,
			persistChanged: false,
		},
	}
}

func (t *timetableHandler) getTimetablesForLine(params json.RawMessage) (json.RawMessage, error) {
	var line types.LineIdentifier
	_ = json.Unmarshal(params, &line)
	result := make([]types.Timetable, 0, 0)
	for _, tt := range t.manager.Timetables() {
		result = append(result, t.mapper.ToDtoTimeTable(tt))
	}
	return mustMarshal(result), nil
}
