package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"reflect"
)

type propertiesHandler struct {
	manager *scenario.Manager
}

func NewPropertiesHandler(manager *scenario.Manager) *propertiesHandler {
	return &propertiesHandler{manager: manager}
}

func (p *propertiesHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getCenter": {
			description:    "Returns the default map center and zoom for the UI maps.",
			input:          nil,
			output:         reflect.TypeOf(types.Center{}),
			method:         p.getCenter,
			persistChanged: false,
		},
	}
}

func (p *propertiesHandler) getCenter(params json.RawMessage) (json.RawMessage, error) {
	return mustMarshal(mapper.ToDtoCenter(p.manager.Center)), nil
}
