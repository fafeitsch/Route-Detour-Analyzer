package rpc

import (
	"backend/rpc/types"
	"backend/scenario"
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestTimetableHandler_GetTimetablesForLine(t *testing.T) {
	manager := scenario.Empty()
	manager.SaveTimetable(scenario.Timetable{
		Key:     "timetable1",
		LineKey: "line1",
		Name:    "Timetable 1",
		Tours: []scenario.Tour{
			{
				IntervalMinutes: 10,
				LastTour:        "16:30",
				Events:          []scenario.ArrivalDeparture{},
			},
		},
		StationKeys: []string{"station1", "station2", "station3"},
	})
	manager.SaveTimetable(scenario.Timetable{
		Key:     "timetable2",
		LineKey: "line1",
		Name:    "Timetable 2",
		Tours: []scenario.Tour{
			{
				IntervalMinutes: 10,
				LastTour:        "16:30",
				Events:          []scenario.ArrivalDeparture{},
			},
		},
		StationKeys: []string{"station1", "station2", "station3"},
	})
	manager.SaveTimetable(scenario.Timetable{
		Key:     "timetable3",
		LineKey: "line2",
		Name:    "Timetable 3",
		Tours: []scenario.Tour{
			{
				IntervalMinutes: 10,
				LastTour:        "16:30",
				Events:          []scenario.ArrivalDeparture{},
			},
		},
		StationKeys: []string{"station1", "station2", "station3"},
	})
	manager.SaveLine(scenario.Line{Key: "line1", Name: "Test Line 1"})
	lineRequest := types.LineIdentifier{Key: "line1"}
	msg, _ := json.Marshal(lineRequest)
	handler := timetableHandler{manager: manager}
	result, err := handler.getTimetablesForLine(msg)
	require.NoError(t, err)
	var got []types.Timetable
	_ = json.Unmarshal(result, &got)
	assert.Equal(t, []types.Timetable{
		{
			Key:      "timetable1",
			Name:     "Timetable 1",
			LineKey:  "line1",
			LineName: "Test Line 1",
			Tours:    nil,
			Stations: nil,
		},
		{
			Key:      "timetable2",
			Name:     "Timetable 2",
			LineKey:  "line1",
			LineName: "Test Line 1",
			Tours:    nil,
			Stations: nil,
		},
	}, got)
}

func TestTimetableHandler_SaveTimetable(t *testing.T) {
	manager := scenario.Empty()
	manager.SaveLine(scenario.Line{Key: "line1", Name: "Line 1"})
	manager.SaveStation(scenario.Station{Key: "station1", Name: "S1"})
	manager.SaveStation(scenario.Station{Key: "station2", Name: "S2"})
	manager.SaveStation(scenario.Station{Key: "station3", Name: "S3"})
	timetable := types.Timetable{
		Key:     "timetable1",
		Name:    "Timetable 1",
		LineKey: "line1",
		Tours: []types.Tour{
			{
				Events: []types.ArrivalDeparture{
					{
						Departure: "8:00",
					},
					{
						Departure: "8:05",
					},
					{
						Arrival: "8:10",
					},
				},
			},
		},
		Stations: []types.Station{
			{Key: "station1"},
			{Key: "station2"},
			{Key: "station3"},
		},
	}
	body, _ := json.Marshal(timetable)
	handler := timetableHandler{manager: manager}
	_, err := handler.saveTimetable(body)
	require.NoError(t, err)
	saved, ok := manager.Timetable("timetable1")
	assert.True(t, ok)
	assert.Equal(t, "timetable1", saved.Key)
	assert.Equal(t, "Timetable 1", saved.Name)
	assert.Equal(t, "line1", saved.LineKey)
	assert.Equal(t, []scenario.Tour{
		{
			Events: []scenario.ArrivalDeparture{
				{Departure: "8:00"}, {Departure: "8:05"}, {Arrival: "8:10"},
			},
		},
	}, saved.Tours)
	assert.Equal(t, "Line 1", saved.Line().Name)
	assert.Equal(t, 3, len(saved.Stations()))
}

func TestTimetableHandler_DeleteTimetable(t *testing.T) {
	manager := scenario.Empty()
	manager.SaveTimetable(scenario.Timetable{
		Key:  "timetable1",
		Name: "Timetable 1",
	})
	assert.Equal(t, 1, len(manager.Timetables()))
	body, _ := json.Marshal(types.Timetable{Key: "timetable1"})
	handler := timetableHandler{manager: manager}
	_, err := handler.deleteTimetable(body)
	require.NoError(t, err)
	assert.Equal(t, 0, len(manager.Timetables()))
}

func TestTimetableHandler_GetTimetable(t *testing.T) {
	t.Run("error", func(t *testing.T) {
		manager := scenario.Empty()
		body, _ := json.Marshal(types.Timetable{Key: "timetable1"})
		handler := timetableHandler{manager: manager}
		_, err := handler.getTimetable(body)
		require.EqualError(t, err, "could not find timetable with key \"timetable1\"")
	})
	t.Run("success", func(t *testing.T) {
		manager := scenario.Empty()
		manager.SaveLine(scenario.Line{Key: "line1", Name: "Line 1"})
		manager.SaveStation(scenario.Station{Key: "station1", Name: "S1"})
		manager.SaveStation(scenario.Station{Key: "station2", Name: "S2"})
		manager.SaveStation(scenario.Station{Key: "station3", Name: "S3"})
		manager.SaveTimetable(scenario.Timetable{
			Key:     "timetable1",
			LineKey: "line1",
			Name:    "Timetable 1",
			Tours: []scenario.Tour{
				{
					IntervalMinutes: 10,
					LastTour:        "16:30",
					Events: []scenario.ArrivalDeparture{
						{Departure: "8:00"},
						{Departure: "8:05"},
						{Arrival: "8:10"},
					},
				},
			},
			StationKeys: []string{"station1", "station2", "station3"},
		})
		body, _ := json.Marshal(types.Timetable{Key: "timetable1"})
		handler := timetableHandler{manager: manager}
		var tt types.Timetable
		result, err := handler.getTimetable(body)
		require.NoError(t, err)
		_ = json.Unmarshal(result, &tt)
		assert.Equal(t, types.Timetable{
			Name:     "Timetable 1",
			Key:      "timetable1",
			LineKey:  "line1",
			LineName: "Line 1",
			Stations: []types.Station{
				{
					Key:  "station1",
					Name: "S1",
				},
				{
					Key:  "station2",
					Name: "S2",
				},
				{
					Key:  "station3",
					Name: "S3",
				},
			},
			Tours: []types.Tour{
				{
					IntervalMinutes: 10,
					LastTour:        "16:30",
					Events: []types.ArrivalDeparture{
						{Departure: "8:00"},
						{Departure: "8:05"},
						{Arrival: "8:10"},
					},
				},
			},
		}, tt)
	})
}

func TestTimetableHandler_SaveTimetableMetadata(t *testing.T) {
	t.Run("error", func(t *testing.T) {
		manager := scenario.Empty()
		body, _ := json.Marshal(types.Timetable{Key: "timetable1"})
		handler := timetableHandler{manager: manager}
		_, err := handler.saveTimetableMetadata(body)
		require.EqualError(t, err, "could not find timetable with key \"timetable1\"")
	})
	t.Run("success", func(t *testing.T) {
		manager := scenario.Empty()
		manager.SaveLine(scenario.Line{Key: "line1", Name: "Line 1"})
		manager.SaveLine(scenario.Line{Key: "line2", Name: "Line 2"})
		manager.SaveStation(scenario.Station{Key: "station1", Name: "S1"})
		manager.SaveStation(scenario.Station{Key: "station2", Name: "S2"})
		manager.SaveStation(scenario.Station{Key: "station3", Name: "S3"})
		manager.SaveTimetable(scenario.Timetable{
			Key:     "timetable1",
			LineKey: "line1",
			Name:    "Timetable 1",
			Tours: []scenario.Tour{
				{
					IntervalMinutes: 10,
					LastTour:        "16:30",
					Events: []scenario.ArrivalDeparture{
						{Departure: "8:00"},
						{Departure: "8:05"},
						{Arrival: "8:10"},
					},
				},
			},
			StationKeys: []string{"station1", "station2", "station3"},
		})
		body, _ := json.Marshal(types.Timetable{Key: "timetable1", Name: "New Timetable Name", LineKey: "line2"})
		handler := timetableHandler{manager: manager}
		var tt types.Timetable
		result, err := handler.saveTimetableMetadata(body)
		require.NoError(t, err)
		_ = json.Unmarshal(result, &tt)
		assert.Equal(t, types.Timetable{
			Name:     "New Timetable Name",
			Key:      "timetable1",
			LineKey:  "line2",
			LineName: "Line 2",
			Stations: []types.Station{
				{
					Key:  "station1",
					Name: "S1",
				},
				{
					Key:  "station2",
					Name: "S2",
				},
				{
					Key:  "station3",
					Name: "S3",
				},
			},
			Tours: []types.Tour{
				{
					IntervalMinutes: 10,
					LastTour:        "16:30",
					Events: []types.ArrivalDeparture{
						{Departure: "8:00"},
						{Departure: "8:05"},
						{Arrival: "8:10"},
					},
				},
			},
		}, tt)
	})
}
