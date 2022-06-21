package mapper

import (
	"backend/rpc/types"
	"backend/scenario"
	"fmt"
)

func ToDtoLine(line scenario.Line) types.Line {
	stops := make([]types.Station, 0, len(line.Stops))
	for _, station := range line.Stations() {
		stops = append(stops, ToDtoStation(station, false))
	}

	return types.Line{
		Stations: stops,
		Stops:    line.Stops,
		Path:     ToDtoWaypoints(line.Path),
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

func ToDtoWaypoints(waypoints []scenario.Waypoint) []types.Waypoint {
	if waypoints == nil {
		return nil
	}
	path := make([]types.Waypoint, 0, len(waypoints))
	for _, waypoint := range waypoints {
		wp := waypoint
		path = append(path, types.Waypoint{
			Lat:  waypoint.Lat,
			Lng:  waypoint.Lng,
			Dist: &wp.Dist,
			Dur:  &wp.Dur,
			Stop: waypoint.Stop,
		})
	}
	return path
}

func ToVoWaypoints(waypoints []types.Waypoint) []scenario.Waypoint {
	if waypoints == nil {
		return nil
	}
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

func ToDtoVehicle(vehicle scenario.Vehicle) types.Vehicle {
	tasks := make([]types.Task, 0, len(vehicle.Tasks))
	for _, task := range vehicle.Tasks {
		timetableKey := task.TimetableKey
		tourIndex := task.TourIndex
		pathIndex := task.PathIndex
		tasks = append(tasks, types.Task{
			Start:        task.Start,
			Type:         task.Type.Key(),
			Path:         ToDtoWaypoints(task.Path),
			TimetableKey: timetableKey,
			TourIndex:    tourIndex,
			PathIndex:    pathIndex,
		})
	}
	return types.Vehicle{
		Name: vehicle.Name,
		Key:  vehicle.Key,
		Position: types.LatLng{
			Lat: vehicle.Position[0],
			Lng: vehicle.Position[1],
		},
		Tasks: tasks,
	}
}

func ToVoVehicle(vehicle types.Vehicle) (*scenario.Vehicle, error) {
	tasks := make([]scenario.Task, 0, len(vehicle.Tasks))
	for index, task := range vehicle.Tasks {
		timetableKey := task.TimetableKey
		tourIndex := task.TourIndex
		pathIndex := task.PathIndex
		taskType, err := scenario.GetTaskType(task.Type)
		if err != nil {
			return nil, fmt.Errorf("vehicle \"%s\", task %d: %v", vehicle.Name, index, err)
		}
		tasks = append(tasks, scenario.Task{
			Start:        task.Start,
			Type:         taskType,
			Path:         ToVoWaypoints(task.Path),
			TimetableKey: timetableKey,
			TourIndex:    tourIndex,
			PathIndex:    pathIndex,
		})
	}
	return &scenario.Vehicle{
		Name:     vehicle.Name,
		Key:      vehicle.Key,
		Position: []float64{vehicle.Position.Lat, vehicle.Position.Lng},
		Tasks:    tasks,
	}, nil
}

func ToDtoCenter(center scenario.Center) types.Center {
	return types.Center{
		Lat:  center.Lat,
		Lng:  center.Lng,
		Zoom: center.Zoom,
	}
}
