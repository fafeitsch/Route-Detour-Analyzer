package vehicle

import (
	"backend/persistence"
	"encoding/json"
	"fmt"
	"github.com/twpayne/go-polyline"
	"os"
	"path/filepath"
)

type latLng struct {
	lat float64
	lng float64
}

type Vehicle struct {
	Path      string
	Key       string
	position  latLng
	taskIndex int
	task      persistence.Task
}

func NewVehicle(path string, key string) (*Vehicle, error) {
	vehicleFile, err := os.Open(filepath.Join(path, "vehicles", key+".json"))
	if err != nil {
		return nil, err
	}
	defer func() { _ = vehicleFile.Close() }()
	var persisted persistence.Vehicle
	err = json.NewDecoder(vehicleFile).Decode(&persisted)
	if err != nil {
		return nil, fmt.Errorf("could not decode json: %v", err)
	}
	if persisted.Tasks == nil || len(persisted.Tasks) == 0 {
		return nil, fmt.Errorf("cannot open vehicle without any tasks")
	}
	position, _, err := polyline.DecodeCoord([]byte(persisted.Position))
	if err != nil {
		return nil, fmt.Errorf("could not decode poly coord of position: %v", position)
	}
	result := Vehicle{
		Path:      path,
		Key:       key,
		position:  latLng{lat: position[0], lng: position[1]},
		taskIndex: 0,
		task:      persisted.Tasks[0],
	}
	return &result, nil
}
