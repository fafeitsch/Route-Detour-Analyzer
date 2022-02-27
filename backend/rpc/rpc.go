package rpc

import (
	"backend/scenario"
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"runtime/debug"
	"strings"
)

type Request struct {
	Jsonrpc string          `json:"jsonrpc"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params"`
	Id      *string         `json:"id"`
}

type Response struct {
	Jsonrpc string          `json:"jsonrpc"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *Error          `json:"error,omitempty"`
	Id      *string         `json:"id"`
}

type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type Handler interface {
	Methods() map[string]rpcMethod
}

type rpcMethod struct {
	description string
	input       reflect.Type
	output      reflect.Type
	method      Method
}

type Method func(message json.RawMessage) (json.RawMessage, error)

func HandleFunc(manager *scenario.Manager, osrmUrl string) http.HandlerFunc {
	handlers := make(map[string]Handler)
	handlers["osrm"] = &osrmHandler{Url: osrmUrl}
	handlers["lines"] = &lineHandler{OsrmUrl: osrmUrl, Manager: manager}
	handlers["stations"] = &stationHandler{OsrmUrl: osrmUrl, Manager: manager}
	handlers["docs"] = &docHandler{handlers: handlers}
	return func(resp http.ResponseWriter, req *http.Request) {
		resp.Header().Set("Content-Type", "application/json")
		resp.Header().Set("Access-Control-Allow-Origin", "*")
		resp.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		resp.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if req.Method == "OPTIONS" {
			return
		}
		var request Request
		defer func() {
			if r := recover(); r != nil {
				writeError(resp, -32603, request.Id, "a fatal error occurred during the method execution.")
				fmt.Printf("panic during RPC call: %v\n%v", r, string(debug.Stack()))
			}
		}()
		err := json.NewDecoder(req.Body).Decode(&request)
		if err != nil {
			writeError(resp, -32700, nil, "could not parse JSON-RPC request: %v", err)
			return
		}
		parts := strings.Split(req.RequestURI, "/")
		handler, ok := handlers[parts[len(parts)-1]]
		if !ok {
			writeError(resp, 1, request.Id, "the requested JSON-RPC handler \"%s\" was not found", parts[len(parts)-1])
			return
		}
		method, ok := handler.Methods()[request.Method]
		if !ok {
			writeError(resp, -32601, request.Id, "the requested method \"%s\" was not found", request.Method)
			return
		}
		result, err := method.method(request.Params)
		if err != nil {
			writeError(resp, -32603, request.Id, "the method \"%s\" could not be executed properly: %v", request.Method, err)
			return
		}
		response := Response{Id: request.Id, Jsonrpc: "2.0", Result: result}
		_ = json.NewEncoder(resp).Encode(response)
	}
}

func writeError(resp http.ResponseWriter, code int, id *string, format string, params ...interface{}) {
	msg := fmt.Sprintf(format, params...)
	response := Response{
		Id:      id,
		Error:   &Error{Code: code, Message: msg},
		Jsonrpc: "2.0",
	}
	resp.WriteHeader(400)
	_ = json.NewEncoder(resp).Encode(response)
}
