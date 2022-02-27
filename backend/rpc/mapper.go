package rpc

import (
	"backend/persistence"
	"backend/scenario"
)

func mapToDtoLine(line scenario.Line) Line {
	stops := make([]Station, 0, len(line.Stops))
	for _, station := range line.Stations() {
		stops = append(stops, Station{
			Lat:        station.Lat,
			Lng:        station.Lng,
			Key:        station.Key,
			Name:       station.Name,
			IsWaypoint: station.IsWaypoint,
		})
	}
	path := make([]Waypoint, 0, len(line.Path))
	for _, waypoint := range line.Path {
		wp := waypoint
		path = append(path, Waypoint{
			Lat:  waypoint.Lat,
			Lng:  waypoint.Lng,
			Dist: &wp.Dist,
			Dur:  &wp.Dur,
			Stop: waypoint.Stop,
		})
	}
	tours := make([]Tour, 0, len(line.Timetable.Tours))
	for _, tour := range line.Timetable.Tours {
		events := make([]ArrivalDeparture, 0, len(tour.Events))
		for _, event := range tour.Events {
			events = append(events, ArrivalDeparture{
				Arrival:   (*string)(event.Arrival),
				Departure: (*string)(event.Departure),
			})
		}
		tours = append(tours, Tour{
			IntervalMinutes: tour.IntervalMinutes,
			LastTour:        string(tour.LastTour),
			Events:          events,
		})
	}
	return Line{
		Stations:  stops,
		Stops:     line.Stops,
		Path:      path,
		Name:      line.Name,
		Color:     line.Color,
		Key:       line.Key,
		Timetable: Timetable{Tours: tours},
	}
}

func mapToVoLine(line Line) scenario.Line {
	path := make([]persistence.Waypoint, 0, len(line.Path))
	for _, waypoint := range line.Path {
		path = append(path, persistence.Waypoint{
			Lat:  waypoint.Lat,
			Lng:  waypoint.Lng,
			Dist: *waypoint.Dist,
			Dur:  *waypoint.Dur,
			Stop: waypoint.Stop,
		})
	}
	tours := make([]persistence.Tour, 0, len(line.Timetable.Tours))
	for _, tour := range line.Timetable.Tours {
		events := make([]persistence.ArrivalDeparture, 0, len(tour.Events))
		for _, event := range tour.Events {
			var arrival *persistence.TimeString
			if event.Arrival != nil {
				a := persistence.TimeString(*event.Arrival)
				arrival = &a
			}
			var departure *persistence.TimeString
			if event.Departure != nil {
				d := persistence.TimeString(*event.Departure)
				arrival = &d
			}
			events = append(events, persistence.ArrivalDeparture{
				Arrival:   arrival,
				Departure: departure,
			})
		}
		tours = append(tours, persistence.Tour{
			IntervalMinutes: tour.IntervalMinutes,
			LastTour:        persistence.TimeString(tour.LastTour),
			Events:          events,
		})
	}
	return scenario.Line{
		Stops:     line.Stops,
		Path:      path,
		Name:      line.Name,
		Color:     line.Color,
		Key:       line.Key,
		Timetable: persistence.Timetable{Tours: tours},
	}
}
