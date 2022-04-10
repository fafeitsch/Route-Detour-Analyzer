package scenario

import (
	"backend/persistence"
	"encoding/json"
	"errors"
	"fmt"
	polyline2 "github.com/twpayne/go-polyline"
	"os"
	"sync"
)

func LoadFile(path string) (*Manager, error) {
	var scenario persistence.Scenario
	file, err := os.Open(path)
	if errors.Is(err, os.ErrNotExist) {
		scenario = persistence.Scenario{}
	} else if err != nil {
		return nil, fmt.Errorf("could not open file \"%s\": %v", path, err)
	} else {
		err = json.NewDecoder(file).Decode(&scenario)
		if err != nil {
			return nil, fmt.Errorf("could not parse json file: %v", err)
		}
	}
	defer func() { _ = file.Close() }()
	lines := make(map[string]Line)
	stations := make(map[string]Station)
	manager := Manager{
		lines:    lines,
		stations: stations,
		mutex:    sync.RWMutex{},
		filePath: path,
	}
	timetables := convertTimetablesFromPersistence(&manager, scenario.Timetables)
	manager.timetables = timetables
	for _, line := range scenario.Lines {
		waypoints, err := convertWaypoints(line.Path)
		if err != nil {
			return nil, fmt.Errorf("could not understand path of line \"%s\": %v", line.Name, err)
		}
		lines[line.Key] = Line{
			Path:    waypoints,
			Name:    line.Name,
			Color:   line.Color,
			Key:     line.Key,
			Stops:   line.Stops,
			manager: &manager,
		}
	}
	for _, station := range scenario.Stations {
		latLng, _, err := polyline2.DecodeCoord([]byte(station.LatLng))
		if err != nil {
			return nil, fmt.Errorf("could not parse latlng of StationKeys \"%s\": %v", station.Name, err)
		}
		stations[station.Key] = Station{
			Key:        station.Key,
			Name:       station.Name,
			Lat:        latLng[0],
			Lng:        latLng[1],
			IsWaypoint: station.IsWaypoint,
			manager:    &manager,
		}
	}
	return &manager, nil
}

func convertTimetablesFromPersistence(manager *Manager, timetables []persistence.Timetable) map[string]Timetable {
	result := make(map[string]Timetable, 0)
	for _, timetable := range timetables {
		tours := make([]Tour, 0, len(timetable.Tours))
		for _, tour := range timetable.Tours {
			events := make([]ArrivalDeparture, 0, len(tour.Events))
			for _, event := range tour.Events {
				var arrival *TimeString
				if event.Arrival != nil {
					a := TimeString(*event.Arrival)
					arrival = &a
				}
				var departure *TimeString
				if event.Departure != nil {
					d := TimeString(*event.Departure)
					departure = &d
				}
				events = append(events, ArrivalDeparture{
					Arrival:   arrival,
					Departure: departure,
				})
			}
			tours = append(tours, Tour{
				IntervalMinutes: tour.IntervalMinutes,
				LastTour:        TimeString(tour.LastTour),
				Events:          events,
			})
		}
		result[timetable.Key] = Timetable{
			Key:         timetable.Key,
			Line:        timetable.Line,
			Name:        timetable.Name,
			Tours:       tours,
			StationKeys: timetable.Stations,
			manager:     manager,
		}
	}
	return result
}

func (m *Manager) Export() persistence.Scenario {
	m.mutex.RLock()
	defer m.mutex.RUnlock()
	stations := make([]persistence.Station, 0, len(m.stations))
	for _, station := range m.Stations() {
		stations = append(stations, persistence.Station{
			Key:  station.Key,
			Name: station.Name,
			LatLng: string(polyline2.EncodeCoord([]float64{
				station.Lat,
				station.Lng,
			})),
			IsWaypoint: station.IsWaypoint,
		})
	}
	lines := make([]persistence.Line, 0, len(m.lines))
	for _, line := range m.Lines() {
		coords := make([][]float64, 0, len(line.Path))
		meta := make([]persistence.MetaCoord, 0, len(line.Path))
		for _, wp := range line.Path {
			coords = append(coords, []float64{wp.Lat, wp.Lng})
			meta = append(meta, persistence.MetaCoord{
				Dist: wp.Dist,
				Dur:  wp.Dur,
				Stop: wp.Stop,
			})
		}
		lines = append(lines, persistence.Line{
			Stops: line.Stops,
			Path: persistence.Path{
				Geometry: string(polyline2.EncodeCoords(coords)),
				Meta:     meta,
			},
			Name:  line.Name,
			Color: line.Color,
			Key:   line.Key,
		})
	}
	return persistence.Scenario{
		Stations:   stations,
		Lines:      lines,
		Timetables: m.convertTimetablesToPersistence(),
	}
}

func (m *Manager) convertTimetablesToPersistence() []persistence.Timetable {
	timetables := make([]persistence.Timetable, 0, len(m.timetables))
	for _, timetable := range m.Timetables() {
		tours := make([]persistence.Tour, 0, len(timetable.Tours))
		for _, tour := range timetable.Tours {
			events := make([]persistence.ArrivalDeparture, 0, len(tour.Events))
			for _, event := range tour.Events {
				var arrival *string
				if event.Arrival != nil {
					a := string(*event.Arrival)
					arrival = &a
				}
				var departure *string
				if event.Departure != nil {
					d := string(*event.Departure)
					departure = &d
				}
				events = append(events, persistence.ArrivalDeparture{
					Arrival:   arrival,
					Departure: departure,
				})
			}
			tours = append(tours, persistence.Tour{
				IntervalMinutes: tour.IntervalMinutes,
				LastTour:        string(tour.LastTour),
				Events:          events,
			})
		}
		timetables = append(timetables, persistence.Timetable{
			Key:      timetable.Key,
			Line:     timetable.Line,
			Name:     timetable.Name,
			Stations: timetable.StationKeys,
			Tours:    tours,
		})

	}
	return timetables
}
