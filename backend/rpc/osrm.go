package rpc

import (
	"backend/persistence"
	"encoding/json"
	"fmt"
	polyline2 "github.com/twpayne/go-polyline"
	"net/http"
	"reflect"
	"time"
)

var netClient = &http.Client{
	Timeout: time.Second * 10,
}

type Annotation struct {
	Distance []float64 `json:"distance"`
	Duration []float64 `json:"duration"`
}

type Leg struct {
	Annotation Annotation `json:"Annotation"`
}

type Route struct {
	Legs     []Leg  `json:"legs"`
	Geometry string `json:"geometry"`
}

type RouteResponse struct {
	Routes []Route `json:"routes"`
}

type osrmHandler struct {
	Url string
}

func (o *osrmHandler) Methods() map[string]rpcMethod {
	return map[string]rpcMethod{
		"queryRoute": {
			description: "Queries the route connecting the given lat/lng pairs.",
			input:       reflect.TypeOf([]LatLng{}),
			output:      reflect.TypeOf([]Waypoint{}),
			method:      o.queryRoute,
		},
		"queryAddress": {
			description: "Queries the name of the nearest street of the given lat/lng pair.",
			input:       reflect.TypeOf(LatLng{}),
			output:      reflect.TypeOf(AddressResponse{}),
			method:      o.queryAddress,
		},
	}
}

func (o *osrmHandler) queryRoute(params json.RawMessage) (json.RawMessage, error) {
	request, err := decodeLatLngSlice(params)
	if err != nil {
		return nil, err
	}
	waypoints, err := QueryRoute(o.Url, request)
	if err != nil {
		return nil, err
	}
	result, _ := json.Marshal(waypoints)
	return result, nil
}

func QueryRoute(url string, request []LatLng) ([]persistence.Waypoint, error) {
	raw := make([][]float64, 0, len(request))
	for _, coordinate := range request {
		raw = append(raw, []float64{coordinate.Lat, coordinate.Lng})
	}
	polyline := polyline2.EncodeCoords(raw)
	osrmResp, err := netClient.Get(fmt.Sprintf("%s/route/v1/driving/polyline(%s)?overview=full&annotations=true", url, polyline))
	if err != nil {
		return nil, fmt.Errorf("could not query OSRM route: %v", err)
	}
	var osrmRoute RouteResponse
	err = json.NewDecoder(osrmResp.Body).Decode(&osrmRoute)
	if err != nil {
		return nil, fmt.Errorf("could not parse response from osrm: %v", err)
	}
	if len(osrmRoute.Routes) == 0 {
		return []persistence.Waypoint{}, nil
	}
	geometry, _, err := polyline2.DecodeCoords([]byte(osrmRoute.Routes[0].Geometry))
	if err != nil {
		return nil, fmt.Errorf("could not parse polyline from osrm: %v", err)
	}
	return processRoute(geometry, osrmRoute), nil
}

func decodeLatLngSlice(params json.RawMessage) ([]LatLng, error) {
	if params == nil {
		return nil, fmt.Errorf("the parameters are nil")
	}
	var request []LatLng
	err := json.Unmarshal(params, &request)
	if err != nil {
		return nil, fmt.Errorf("could not understand lat/lng request: %v", err)
	}
	return request, nil
}

type osrmAddressResponse struct {
	Waypoints []struct {
		Name string `json:"name"`
	} `json:"waypoints"`
}

func (o *osrmHandler) queryAddress(params json.RawMessage) (json.RawMessage, error) {
	request, err := decodeLatLng(params)
	if err != nil {
		return nil, err
	}
	osrmResp, err := netClient.Get(fmt.Sprintf("%s/nearest/v1/driving/%f,%f.json?number=1", o.Url, request.Lng, request.Lat))
	if err != nil {
		return nil, fmt.Errorf("could not query OSRM Route: %v", err)
	}
	var osrmWaypoints osrmAddressResponse
	err = json.NewDecoder(osrmResp.Body).Decode(&osrmWaypoints)
	if err != nil {
		return nil, fmt.Errorf("could not parse response from osrm: %v", err)
	}
	name := ""
	if len(osrmWaypoints.Waypoints) > 0 {
		name = osrmWaypoints.Waypoints[0].Name
	}
	response := struct {
		Name string `json:"name"`
	}{Name: name}
	result, _ := json.Marshal(response)
	return result, nil
}

func decodeLatLng(params json.RawMessage) (*LatLng, error) {
	var request LatLng
	err := json.Unmarshal(params, &request)
	if err != nil {
		return nil, fmt.Errorf("could not understand lat/lng request: %v", err)
	}
	return &request, nil
}

func processRoute(geometry [][]float64, osrmRoute RouteResponse) []persistence.Waypoint {
	waypoints := make([]persistence.Waypoint, 0, len(geometry))
	for _, wp := range geometry {
		if len(waypoints) > 1 {
			lastWp := waypoints[len(waypoints)-1]
			// sometimes we get two identical waypoints. We filter them out.
			if lastWp.Lat == wp[0] && lastWp.Lng == wp[1] {
				continue
			}
		}
		waypoints = append(waypoints, persistence.Waypoint{
			Lat: wp[0],
			Lng: wp[1],
		})
	}

	wpIndex := 0
	for _, leg := range osrmRoute.Routes[0].Legs {
		waypoints[wpIndex].Stop = true
		// have to check the wpIndex here and after the for loop. Because of the
		// filtered waypoints (see above) their length isn't equal to the number
		// of legs any more
		for index := 0; wpIndex < len(waypoints) && index < len(leg.Annotation.
			Distance); index++ {
			waypoints[wpIndex].Dur = leg.Annotation.Duration[index]
			waypoints[wpIndex].Dist = leg.Annotation.Distance[index]
			wpIndex = wpIndex + 1
		}
		if wpIndex >= len(waypoints) {
			break
		}
	}
	waypoints[len(waypoints)-1].Stop = true
	return waypoints
}
