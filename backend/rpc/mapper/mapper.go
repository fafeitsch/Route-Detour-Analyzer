package mapper

import (
	"backend/rpc/types"
	"backend/scenario"
)

type Mapper struct {
	manager *scenario.Manager
}

func New(manager *scenario.Manager) Mapper {
	return Mapper{manager: manager}
}

func (m *Mapper) ToDtoLine(line scenario.Line) types.Line {
	stops := make([]types.Station, 0, len(line.Stops))
	for _, station := range line.Stations() {
		stops = append(stops, types.Station{
			Lat:        station.Lat,
			Lng:        station.Lng,
			Key:        station.Key,
			Name:       station.Name,
			IsWaypoint: station.IsWaypoint,
		})
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

func (m *Mapper) ToDtoStation(station scenario.Station, expandLines bool) types.Station {
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

func (m *Mapper) ToVoLine(line types.Line) scenario.Line {
	path := make([]scenario.Waypoint, 0, len(line.Path))
	for _, waypoint := range line.Path {
		path = append(path, scenario.Waypoint{
			Lat:  waypoint.Lat,
			Lng:  waypoint.Lng,
			Dist: *waypoint.Dist,
			Dur:  *waypoint.Dur,
			Stop: waypoint.Stop,
		})
	}
	return scenario.Line{
		Stops: line.Stops,
		Path:  path,
		Name:  line.Name,
		Color: line.Color,
		Key:   line.Key,
	}
}

func (m *Mapper) ToVoWaypoints(waypoints []types.Waypoint) []scenario.Waypoint {
	result := make([]scenario.Waypoint, 0, len(waypoints))
	for _, wp := range waypoints {
		result = append(result, scenario.Waypoint{
			Lat:  wp.Lat,
			Lng:  wp.Lng,
			Dist: *wp.Dist,
			Dur:  *wp.Dur,
			Stop: wp.Stop,
		})
	}
	return result
}

func (m *Mapper) ToDtoTimetable(timetable scenario.Timetable) types.Timetable {
	tours := make([]types.Tour, 0, len(timetable.Tours))
	stations := make([]types.Station, 0, len(timetable.StationKeys))
	for _, station := range timetable.Stations() {
		stations = append(stations, m.ToDtoStation(station, false))
	}
	for _, tour := range timetable.Tours {
		events := make([]types.ArrivalDeparture, 0, len(tour.Events))
		for _, event := range tour.Events {
			events = append(events, types.ArrivalDeparture{
				Arrival:   (*string)(event.Arrival),
				Departure: (*string)(event.Departure),
			})
		}
		tours = append(tours, types.Tour{
			IntervalMinutes: tour.IntervalMinutes,
			LastTour:        string(tour.LastTour),
			Events:          events,
		})
	}
	result := types.Timetable{
		Key:      timetable.Key,
		Name:     timetable.Name,
		Tours:    tours,
		Stations: stations,
	}
	if timetable.Line != nil {
		line, _ := m.manager.Line(*timetable.Line)
		result.LineKey = &line.Key
		result.LineName = &line.Name
	}
	return result
}

func (m *Mapper) ToVoTimetable(timetable types.Timetable) (scenario.Timetable, error) {
	tours := make([]scenario.Tour, 0, len(timetable.Tours))
	for _, tour := range timetable.Tours {
		events := make([]scenario.ArrivalDeparture, 0, len(tour.Events))
		for _, event := range tour.Events {
			var arrival *scenario.TimeString
			if event.Arrival != nil {
				a := scenario.TimeString(*event.Arrival)
				arrival = &a
			}
			var departure *scenario.TimeString
			if event.Departure != nil {
				d := scenario.TimeString(*event.Departure)
				departure = &d
			}
			events = append(events, scenario.ArrivalDeparture{
				Arrival:   arrival,
				Departure: departure,
			})
		}
		tours = append(tours, scenario.Tour{
			IntervalMinutes: tour.IntervalMinutes,
			LastTour:        scenario.TimeString(tour.LastTour),
			Events:          events,
		})
	}
	stations := make([]string, 0, len(timetable.Stations))
	for _, station := range timetable.Stations {
		stations = append(stations, station.Key)
	}
	return scenario.Timetable{
		Key:         timetable.Key,
		Line:        timetable.LineKey,
		Name:        timetable.Name,
		Tours:       tours,
		StationKeys: stations,
	}, nil
}
