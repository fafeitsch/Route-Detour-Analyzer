package rpc

import (
	"backend/rpc/mapper"
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"fmt"
	"reflect"
)

type vehicleHandler struct {
	manager *scenario.Manager
}

func newVehicleHandler(manager *scenario.Manager) *timetableHandler {
	return &timetableHandler{
		manager: manager,
	}
}

func (v *vehicleHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"getVehicles": {
			description: "Returns a list of all vehicles. Does not return the tasks of the vehicle",
			input:       reflect.TypeOf(nil),
			output:      reflect.TypeOf([]types.Vehicle{}),
			method:      v.getVehicles,
		},
		"saveVehicle": {
			description: "Saves the given vehicle or creates it if the key doesn't exist yet.",
			input:       reflect.TypeOf(types.Vehicle{}),
			output:      reflect.TypeOf(types.Vehicle{}),
			method:      v.saveVehicle,
		},
		"saveVehicleMetadata": {
			description: "Saves the name and the position of the vehicle, but doesn't touch the tasks. Can only be used to updated existing vehicles.",
			input:       reflect.TypeOf(types.Vehicle{}),
			output:      reflect.TypeOf(types.Vehicle{}),
			method:      v.saveVehicleMetadata,
		},
		"deleteVehicle": {
			description: "Deletes the vehicle",
			input:       reflect.TypeOf(types.Vehicle{}),
			method:      v.deleteVehicle,
		},
	}
}

func (v *vehicleHandler) getVehicles(data json.RawMessage) (json.RawMessage, error) {
	vehicles := v.manager.Vehicles()
	result := make([]types.Vehicle, 0, len(vehicles))
	for _, vehicle := range vehicles {
		result = append(result, mapper.ToDtoVehicle(vehicle))
	}
	return mustMarshal(result), nil
}

func (v *vehicleHandler) saveVehicle(data json.RawMessage) (json.RawMessage, error) {
	var vehicle types.Vehicle
	_ = json.Unmarshal(data, &vehicle)
	converted, err := mapper.ToVoVehicle(vehicle)
	if err != nil {
		return nil, err
	}
	result := v.manager.SaveVehicle(*converted)
	return mustMarshal(mapper.ToDtoVehicle(result)), nil
}

func (v *vehicleHandler) saveVehicleMetadata(data json.RawMessage) (json.RawMessage, error) {
	var vehicle types.Vehicle
	_ = json.Unmarshal(data, &vehicle)
	found, ok := v.manager.Vehicle(vehicle.Key)
	if !ok {
		return nil, fmt.Errorf("the vehicle with key \"%s\" was not found", vehicle.Key)
	}
	// error can be ignored because we will not touch the metadata:
	converted, _ := mapper.ToVoVehicle(vehicle)
	found.Name = converted.Name
	found.Position = converted.Position
	result := v.manager.SaveVehicle(found)
	return mustMarshal(mapper.ToDtoVehicle(result)), nil
}

func (v *vehicleHandler) deleteVehicle(data json.RawMessage) (json.RawMessage, error) {
	var vehicle types.Vehicle
	_ = json.Unmarshal(data, &vehicle)
	v.manager.DeleteVehicle(vehicle.Key)
	return nil, nil
}
