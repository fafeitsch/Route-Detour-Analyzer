package rpc

import (
	"encoding/json"
	"fmt"
)

func mustMarshal(object interface{}) []byte {
	result, err := json.Marshal(object)
	if err != nil {
		panic(fmt.Sprintf("can not marshal object: %v", err))
	}
	return result
}
