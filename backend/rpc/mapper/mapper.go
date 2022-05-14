package mapper

import (
	"backend/rpc/types"
	"backend/scenario"
)

func ToDtoLine(line scenario.Line) types.Line {
	stops := make([]types.Station, 0, len(line.Stops))
	for _, station := range line.Stations() {
		stops = append(stops, ToDtoStation(station, false))
	}
	path := make([]types.Waypoint, 0, len(line.Path))
	for _, waypoint := range line.Path {
		wp := waypoint
		path = append(path, types.Waypoint{
			Lat:  waypoint.Lat,
			Lng:  waypoint.Lng,
			Dist: &wp.Dist,
			Dur:  &wp.Dur,
			Stop: waypoint.Stop,
		})
	}
	return types.Line{
		Stations: stops,
		Stops:    line.Stops,
		Path:     path,
		Name:     line.Name,
		Color:    line.Color,
		Key:      line.Key,
	}
}

func ToDtoStation(station scenario.Station, expandLines bool) types.Station {
	var convertedLines []types.LineIdentifier
	if expandLines {
		lines := station.Lines()
		convertedLines = make([]types.LineIdentifier, 0, len(lines))
		for _, line := range lines {
			convertedLines = append(convertedLines, types.LineIdentifier{
				Key:  line.Key,
				Name: line.Name,
			})
		}
	}
	return types.Station{
		Lat:        station.Lat,
		Lng:        station.Lng,
		Key:        station.Key,
		Name:       station.Name,
		IsWaypoint: station.IsWaypoint,
		Lines:      convertedLines,
	}
}

func ToVoLine(line types.Line) scenario.Line {
	path := ToVoWaypoints(line.Path)
	return scenario.Line{
		Stops: line.Stops,
		Path:  path,
		Name:  line.Name,
		Color: line.Color,
		Key:   line.Key,
	}
}

func ToVoWaypoints(waypoints []types.Waypoint) []scenario.Waypoint {
	result := make([]scenario.Waypoint, 0, len(waypoints))
	for _, wp := range waypoints {
		dist := 0.0
		if wp.Dist != nil {
			dist = *wp.Dist
		}
		dur := 0.0
		if wp.Dur != nil {
			dur = *wp.Dur
		}
		result = append(result, scenario.Waypoint{
			Lat:  wp.Lat,
			Lng:  wp.Lng,
			Dist: dist,
			Dur:  dur,
			Stop: wp.Stop,
		})
	}
	return result
}

func ToDtoTimetable(timetable scenario.Timetable) types.Timetable {
	tours := make([]types.Tour, 0, len(timetable.Tours))
	stations := make([]types.Station, 0, len(timetable.StationKeys))
	for _, station := range timetable.Stations() {
		stations = append(stations, ToDtoStation(station, false))
	}
	for _, tour := range timetable.Tours {
		events := make([]types.ArrivalDeparture, 0, len(tour.Events))
		for _, event := range tour.Events {
			arrDep := types.ArrivalDeparture{
				Arrival:   event.Arrival,
				Departure: event.Departure,
			}
			events = append(events, arrDep)
		}
		tours = append(tours, types.Tour{
			IntervalMinutes: tour.IntervalMinutes,
			LastTour:        tour.LastTour,
			Events:          events,
		})
	}
	result := types.Timetable{
		Key:      timetable.Key,
		Name:     timetable.Name,
		Tours:    tours,
		Stations: stations,
	}
	result.LineKey = timetable.Line().Key
	result.LineName = timetable.Line().Name
	return result
}

func ToVoTimetable(timetable types.Timetable) scenario.Timetable {
	tours := make([]scenario.Tour, 0, len(timetable.Tours))
	for _, tour := range timetable.Tours {
		events := make([]scenario.ArrivalDeparture, 0, len(tour.Events))
		for _, event := range tour.Events {
			events = append(events, scenario.ArrivalDeparture{
				Arrival:   event.Arrival,
				Departure: event.Departure,
			})
		}
		tours = append(tours, scenario.Tour{
			IntervalMinutes: tour.IntervalMinutes,
			LastTour:        tour.LastTour,
			Events:          events,
		})
	}
	stations := make([]string, 0, len(timetable.Stations))
	for _, station := range timetable.Stations {
		stations = append(stations, station.Key)
	}
	return scenario.Timetable{
		Key:         timetable.Key,
		LineKey:     timetable.LineKey,
		Name:        timetable.Name,
		Tours:       tours,
		StationKeys: stations,
	}
}
