package rpc

import (
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestPropertiesHandler_Methods(t *testing.T) {
	t.Run("test getCenter", func(t *testing.T) {
		manager := scenario.Empty()
		manager.Center.Zoom = 14
		manager.Center.Lat = 29
		manager.Center.Lng = 23
		handler := NewPropertiesHandler(manager)
		raw, err := handler.Methods()["getCenter"].method(nil)
		assert.NoError(t, err)
		var got types.Center
		_ = json.Unmarshal(raw, &got)
		assert.Equal(t, types.Center{Lat: 29, Lng: 23, Zoom: 14}, got)
	})
}
