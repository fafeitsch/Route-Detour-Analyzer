package rpc

import (
	"backend/scenario"
	"bytes"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func TestHandleFunc(t *testing.T) {
	manager, err := scenario.New(filepath.Join("..", "testdata", "wuerzburg.json"))
	require.NoError(t, err)

	handler := HandleFunc(manager, "")

	t.Run("normal execution", func(t *testing.T) {
		t.Parallel()
		id := "555"
		params := LineIdentifier{Key: "7BNJI4rUT6"}
		rpcRequest := Request{
			Jsonrpc: "2.0",
			Method:  "getLine",
			Params:  mustMarshal(params),
			Id:      &id,
		}
		payload := mustMarshal(rpcRequest)
		request := httptest.NewRequest("POST", "http://localhost/lines", bytes.NewReader(payload))
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		assert.Equal(t, http.StatusOK, recorder.Code)
		var response Response
		_ = json.Unmarshal(recorder.Body.Bytes(), &response)
		assert.Equal(t, "555", *response.Id)
		assert.Nil(t, response.Error)
		assert.Equal(t, "2.0", response.Jsonrpc)
		var line Line
		_ = json.Unmarshal(response.Result, &line)
		assert.Equal(t, "Linie 29: Busbahnhof → Hubland Nord", line.Name)
	})

	t.Run("handler not found", func(t *testing.T) {
		t.Parallel()
		id := "666"
		rpcRequest := Request{
			Jsonrpc: "2.0",
			Method:  "getLine",
			Id:      &id,
		}
		payload := mustMarshal(rpcRequest)
		request := httptest.NewRequest("POST", "http://localhost/not_existing", bytes.NewReader(payload))
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		assert.Equal(t, http.StatusBadRequest, recorder.Code)
		var response Response
		_ = json.Unmarshal(recorder.Body.Bytes(), &response)
		assert.Equal(t, "666", *response.Id)
		assert.Nil(t, response.Result)
		assert.Equal(t, "2.0", response.Jsonrpc)
		assert.Equal(t, "the requested JSON-RPC handler \"not_existing\" was not found", response.Error.Message)
		assert.Equal(t, 1, response.Error.Code)
	})

	t.Run("method not found", func(t *testing.T) {
		t.Parallel()
		id := "777"
		rpcRequest := Request{
			Jsonrpc: "2.0",
			Method:  "not_existing",
			Id:      &id,
		}
		payload := mustMarshal(rpcRequest)
		request := httptest.NewRequest("POST", "http://localhost/lines", bytes.NewReader(payload))
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		assert.Equal(t, http.StatusBadRequest, recorder.Code)
		var response Response
		_ = json.Unmarshal(recorder.Body.Bytes(), &response)
		assert.Equal(t, "777", *response.Id)
		assert.Nil(t, response.Result)
		assert.Equal(t, "2.0", response.Jsonrpc)
		assert.Equal(t, "the requested method \"not_existing\" was not found", response.Error.Message)
		assert.Equal(t, -32601, response.Error.Code)
	})

	t.Run("method execution not working", func(t *testing.T) {
		t.Parallel()
		id := "888"
		params := LineIdentifier{Key: "not existing"}
		rpcRequest := Request{
			Jsonrpc: "2.0",
			Method:  "getLine",
			Params:  mustMarshal(params),
			Id:      &id,
		}
		payload := mustMarshal(rpcRequest)
		request := httptest.NewRequest("POST", "http://localhost/lines", bytes.NewReader(payload))
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		assert.Equal(t, http.StatusBadRequest, recorder.Code)
		var response Response
		_ = json.Unmarshal(recorder.Body.Bytes(), &response)
		assert.Equal(t, "888", *response.Id)
		assert.Nil(t, response.Result)
		assert.Equal(t, "2.0", response.Jsonrpc)
		assert.Equal(t, "the method \"getLine\" could not be executed properly: no line with name \"not existing\" found", response.Error.Message)
		assert.Equal(t, -32603, response.Error.Code)
	})

	t.Run("unparsable request", func(t *testing.T) {
		t.Parallel()
		request := httptest.NewRequest("POST", "http://localhost/lines", bytes.NewReader([]byte("{{{")))
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, request)
		assert.Equal(t, http.StatusBadRequest, recorder.Code)
		var response Response
		_ = json.Unmarshal(recorder.Body.Bytes(), &response)
		assert.Nil(t, response.Id)
		assert.Nil(t, response.Result)
		assert.Equal(t, "2.0", response.Jsonrpc)
		assert.Equal(t, "could not parse JSON-RPC request: invalid character '{' looking for beginning of object key string", response.Error.Message)
		assert.Equal(t, -32700, response.Error.Code)
	})
}
