package osrmutils

import (
	"backend/rpc/types"
	"encoding/json"
	"fmt"
	polyline2 "github.com/twpayne/go-polyline"
	"net/http"
	"time"
)

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

var netClient = &http.Client{
	Timeout: time.Second * 10,
}

func QueryRoute(url string, request []types.LatLng) ([]types.Waypoint, error) {
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
		return []types.Waypoint{}, nil
	}
	geometry, _, err := polyline2.DecodeCoords([]byte(osrmRoute.Routes[0].Geometry))
	if err != nil {
		return nil, fmt.Errorf("could not parse polyline \"%s\" from osrm: %v", osrmRoute.Routes[0].Geometry, err)
	}
	return processRoute(geometry, osrmRoute), nil
}

func processRoute(geometry [][]float64, osrmRoute RouteResponse) []types.Waypoint {
	waypoints := make([]types.Waypoint, 0, len(geometry))
	for _, wp := range geometry {
		if len(waypoints) > 1 {
			lastWp := waypoints[len(waypoints)-1]
			// sometimes we get two identical waypoints. We filter them out.
			if lastWp.Lat == wp[0] && lastWp.Lng == wp[1] {
				continue
			}
		}
		waypoints = append(waypoints, types.Waypoint{
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
			waypoints[wpIndex].Dur = &leg.Annotation.Duration[index]
			waypoints[wpIndex].Dist = &leg.Annotation.Distance[index]
			wpIndex = wpIndex + 1
		}
		if wpIndex >= len(waypoints) {
			break
		}
	}
	waypoints[len(waypoints)-1].Stop = true
	return waypoints
}

type osrmAddressResponse struct {
	Waypoints []struct {
		Name string `json:"name"`
	} `json:"waypoints"`
}

func QueryAddress(url string, latLng types.LatLng) (string, error) {
	osrmResp, err := netClient.Get(fmt.Sprintf("%s/nearest/v1/driving/%f,%f.json?number=1", url, latLng.Lng, latLng.Lat))
	if err != nil {
		return "", fmt.Errorf("could not query OSRM Route: %v", err)
	}
	var osrmWaypoints osrmAddressResponse
	err = json.NewDecoder(osrmResp.Body).Decode(&osrmWaypoints)
	if err != nil {
		return "", fmt.Errorf("could not parse response from osrm: %v", err)
	}
	name := ""
	if len(osrmWaypoints.Waypoints) > 0 {
		name = osrmWaypoints.Waypoints[0].Name
	}
	return name, nil
}

func DistanceBetweenStations(path []types.Waypoint) []float64 {
	result := make([]float64, 0, 0)
	current := 0.0
	for _, waypoint := range path {
		if waypoint.Stop {
			result = append(result, current)
		}
		var dist float64
		if waypoint.Dist == nil {
			dist = 0.0
		} else {
			dist = *waypoint.Dist
		}
		current = current + dist
	}
	return result
}

func CreateQueryPairs(stops []types.Station, cap int) [][2]int {
	numberOfStops := 0
	for _, station := range stops {
		if !station.IsWaypoint {
			numberOfStops = numberOfStops + 1
		}
	}
	gap := numberOfStops - cap
	result := make([][2]int, 0, 0)
	for leftIndex, leftStation := range stops {
		if leftStation.IsWaypoint {
			continue
		}
		counter := 1
		for shiftedIndex, rightStation := range stops[leftIndex+1:] {
			if !rightStation.IsWaypoint {
				counter = counter + 1
			}
			if rightStation.IsWaypoint || counter < gap {
				continue
			}
			result = append(result, [2]int{
				leftIndex,
				leftIndex + shiftedIndex + 1,
			})
		}
	}
	return result
}
