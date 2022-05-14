package mapper

import (
	"backend/rpc/types"
	"backend/scenario"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestMapper_ToDtoStation(t *testing.T) {
	manager := scenario.Empty()
	station := scenario.Station{
		Key:        "abc",
		Name:       "Main Station",
		Lat:        77.8,
		Lng:        88.7,
		IsWaypoint: true,
	}
	station = manager.SaveStation(station)
	manager.SaveLine(scenario.Line{
		Name:  "Line A",
		Key:   "xyz",
		Stops: []string{"abc"},
	})
	t.Run("expand lines", func(t *testing.T) {
		got := ToDtoStation(station, true)
		assert.Equal(t, types.Station{
			Lat:        77.8,
			Lng:        88.7,
			Key:        "abc",
			Name:       "Main Station",
			IsWaypoint: true,
			Lines:      []types.LineIdentifier{{Name: "Line A", Key: "xyz"}},
		}, got)
	})
	t.Run("no expand lines", func(t *testing.T) {
		got := ToDtoStation(station, false)
		assert.Equal(t, types.Station{
			Lat:        77.8,
			Lng:        88.7,
			Key:        "abc",
			Name:       "Main Station",
			IsWaypoint: true,
			Lines:      nil,
		}, got)
	})
}

func TestMapper_ToDtoLine(t *testing.T) {
	manager := scenario.Empty()
	dist := 89.0
	dur := 10.0
	line := scenario.Line{
		Stops: []string{"a", "b", "c"},
		Path: []scenario.Waypoint{
			{
				Lat:  99,
				Lng:  55,
				Dist: 89,
				Dur:  10.0,
				Stop: false,
			},
			{
				Lat:  10,
				Lng:  33,
				Dist: 0,
				Dur:  0,
				Stop: true,
			},
		},
		Name:  "Line X",
		Color: "yellow",
		Key:   "abc-line",
	}
	manager.SaveStation(scenario.Station{
		Name: "Station A",
		Lat:  10,
		Lng:  20,
		Key:  "a",
	})
	manager.SaveStation(scenario.Station{
		Name:       "Station B",
		Lat:        30,
		Lng:        40,
		IsWaypoint: true,
		Key:        "b",
	})
	manager.SaveStation(scenario.Station{
		Name: "Station C",
		Lat:  50,
		Lng:  60,
		Key:  "c",
	})
	line = manager.SaveLine(line)
	got := ToDtoLine(line)
	zero := 0.0
	assert.Equal(t, types.Line{
		Stations: []types.Station{
			{
				Lat:        10,
				Lng:        20,
				Key:        "a",
				Name:       "Station A",
				IsWaypoint: false,
				Lines:      nil,
			},
			{
				Lat:        30,
				Lng:        40,
				Key:        "b",
				Name:       "Station B",
				IsWaypoint: true,
				Lines:      nil,
			},
			{
				Lat:        50,
				Lng:        60,
				Key:        "c",
				Name:       "Station C",
				IsWaypoint: false,
				Lines:      nil,
			},
		},
		Stops: []string{"a", "b", "c"},
		Path: []types.Waypoint{
			{
				Lat:  99,
				Lng:  55,
				Dist: &dist,
				Dur:  &dur,
				Stop: false,
			},
			{
				Lat:  10,
				Lng:  33,
				Dist: &zero,
				Dur:  &zero,
				Stop: true,
			},
		},
		Key:   "abc-line",
		Name:  "Line X",
		Color: "yellow",
	}, got)
}

func TestMapper_ToVoLine(t *testing.T) {
	dist := 89.0
	dur := 10.0
	waypoints := []types.Waypoint{
		{
			Lat:  12,
			Lng:  13,
			Dist: &dist,
			Dur:  &dur,
			Stop: true,
		}, {
			Lat:  77,
			Lng:  68,
			Dist: nil,
			Dur:  nil,
			Stop: false,
		},
	}
	line := types.Line{
		Stations: nil,
		Stops:    []string{"a", "b", "c"},
		Path:     waypoints,
		Key:      "line-xyz",
		Name:     "Line 88",
		Color:    "red",
	}
	got := ToVoLine(line)
	assert.Equal(t, scenario.Line{
		Stops: []string{"a", "b", "c"},
		Path: []scenario.Waypoint{
			{
				Lat:  12,
				Lng:  13,
				Dist: 89.0,
				Dur:  10,
				Stop: true,
			}, {
				Lat:  77,
				Lng:  68,
				Dist: 0,
				Dur:  0,
				Stop: false,
			},
		},
		Name:  "Line 88",
		Color: "red",
		Key:   "line-xyz",
	}, got)
}

func TestMapper_ToVoWaypoints(t *testing.T) {
	dist := 89.0
	dur := 10.0
	waypoints := []types.Waypoint{
		{
			Lat:  12,
			Lng:  13,
			Dist: &dist,
			Dur:  &dur,
			Stop: true,
		}, {
			Lat:  77,
			Lng:  68,
			Dist: nil,
			Dur:  nil,
			Stop: false,
		},
	}
	got := ToVoWaypoints(waypoints)
	assert.Equal(t, []scenario.Waypoint{
		{
			Lat:  12,
			Lng:  13,
			Dist: 89.0,
			Dur:  10,
			Stop: true,
		}, {
			Lat:  77,
			Lng:  68,
			Dist: 0,
			Dur:  0,
			Stop: false,
		},
	}, got)
}

func TestMapper_ToDtoTimetable(t *testing.T) {
	manager := scenario.Empty()
	manager.SaveStation(scenario.Station{
		Name: "Station A",
		Lat:  10,
		Lng:  20,
		Key:  "a",
	})
	manager.SaveStation(scenario.Station{
		Name:       "Station B",
		Lat:        30,
		Lng:        40,
		IsWaypoint: true,
		Key:        "b",
	})
	manager.SaveStation(scenario.Station{
		Name: "Station C",
		Lat:  50,
		Lng:  60,
		Key:  "c",
	})
	timetable := scenario.Timetable{
		Key:  "tt-abc",
		Name: "Working Day",
		Tours: []scenario.Tour{
			{
				IntervalMinutes: 30,
				LastTour:        "16:30",
				Events: []scenario.ArrivalDeparture{
					{Departure: "8:30"},
					{Departure: "8:35"},
					{Arrival: "8:40"},
				},
			},
			{
				Events: []scenario.ArrivalDeparture{
					{Departure: "17:30"},
					{Departure: "17:35"},
					{Arrival: "17:40"},
				},
			},
		},
		StationKeys: []string{"a", "b", "c"},
	}
	timetable = manager.SaveTimetable(timetable)
	got := ToDtoTimetable(timetable)
	assert.Equal(t, types.Timetable{
		Key:      "tt-abc",
		Name:     "Working Day",
		LineKey:  "",
		LineName: "",
		Tours: []types.Tour{
			{
				IntervalMinutes: 30,
				LastTour:        "16:30",
				Events: []types.ArrivalDeparture{
					{Departure: "8:30"},
					{Departure: "8:35"},
					{Arrival: "8:40"},
				},
			},
			{
				Events: []types.ArrivalDeparture{
					{Departure: "17:30"},
					{Departure: "17:35"},
					{Arrival: "17:40"},
				},
			},
		},
		Stations: []types.Station{
			{
				Lat:        10,
				Lng:        20,
				Key:        "a",
				Name:       "Station A",
				IsWaypoint: false,
				Lines:      nil,
			},
			{
				Lat:        30,
				Lng:        40,
				Key:        "b",
				Name:       "Station B",
				IsWaypoint: true,
				Lines:      nil,
			},
			{
				Lat:        50,
				Lng:        60,
				Key:        "c",
				Name:       "Station C",
				IsWaypoint: false,
				Lines:      nil,
			},
		},
	}, got)
}

func TestMapper_ToVoTimetable(t *testing.T) {
	timetable := types.Timetable{
		Key:  "tt-abc",
		Name: "Working Day",
		Tours: []types.Tour{
			{
				IntervalMinutes: 30,
				LastTour:        "16:30",
				Events: []types.ArrivalDeparture{
					{Departure: "8:30"},
					{Departure: "8:35"},
					{Arrival: "8:40"},
				},
			},
			{
				Events: []types.ArrivalDeparture{
					{Departure: "17:30"},
					{Departure: "17:35"},
					{Arrival: "17:40"},
				},
			},
		},
		Stations: []types.Station{{Key: "a"}, {Key: "b"}, {Key: "c"}},
	}
	got := ToVoTimetable(timetable)
	assert.Equal(t, scenario.Timetable{
		Key:     "tt-abc",
		Name:    "Working Day",
		LineKey: "",
		Tours: []scenario.Tour{
			{
				IntervalMinutes: 30,
				LastTour:        "16:30",
				Events: []scenario.ArrivalDeparture{
					{Departure: "8:30"},
					{Departure: "8:35"},
					{Arrival: "8:40"},
				},
			},
			{
				Events: []scenario.ArrivalDeparture{
					{Departure: "17:30"},
					{Departure: "17:35"},
					{Arrival: "17:40"},
				},
			},
		},
		StationKeys: []string{"a", "b", "c"},
	}, got)
}
