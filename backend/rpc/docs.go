package rpc

import (
	"encoding/json"
	"reflect"
)

type docHandler struct {
	handlers map[string]Handler
}

func (d *docHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"describe": {
			description: "Describes the complete RPC API.",
			output:      reflect.TypeOf([]docuTopic{}),
			method:      d.describe,
		},
	}
}

func (d *docHandler) describe(params json.RawMessage) (json.RawMessage, error) {
	topics := make([]docuTopic, 0, 0)
	for topic, handler := range d.handlers {
		methodMap := handler.Methods()
		methods := make([]docuMethod, 0, len(methodMap))
		for name, method := range methodMap {
			methods = append(methods, docuMethod{Method: name, Description: method.description})
		}
		topics = append(topics, docuTopic{Name: topic, Methods: methods})
	}
	return mustMarshal(topics), nil
}

type docuTopic struct {
	Name    string       `json:"name"`
	Methods []docuMethod `json:"methods"`
}

type docuMethod struct {
	Description string `json:"description"`
	Method      string `json:"method"`
}
