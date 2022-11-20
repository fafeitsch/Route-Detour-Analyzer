package vehicle

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_findPosition(t *testing.T) {
	t.Run("normal", func(t *testing.T) {
		waypoints := []waypoint{
			{dist: 5, latLng: latLng{Lat: 30, Lng: 0}},
			{dist: 10, latLng: latLng{Lat: 30, Lng: 5}},
			{dist: 15, latLng: latLng{Lat: 30, Lng: 15}},
			{dist: 8, latLng: latLng{Lat: 30, Lng: 30}},
			{dist: 0, latLng: latLng{Lat: 30, Lng: 38}},
		}
		got := findPosition(23.0, waypoints)
		assert.Equal(t, latLng{Lat: 30, Lng: 23}, got)
	})
}
