package persistence

import (
	"sync"
)

type Scenario struct {
	Stations []Station    `json:"stations"`
	Lines    []Line       `json:"lines"`
	Lock     sync.RWMutex `json:"-"`
}

type Station struct {
	Key        string  `json:"key"`
	Name       string  `json:"name"`
	Lat        float64 `json:"lat"`
	Lng        float64 `json:"lng"`
	IsWaypoint bool    `json:"isWaypoint"`
}

type Line struct {
	Stops     []Stop    `json:"stops"`
	Path      Path      `json:"path"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	Key       string    `json:"key"`
	Timetable Timetable `json:"timetable"`
}

type Stop struct {
	Key string `json:"key"`
}

type Path struct {
	Waypoints []Waypoint `json:"waypoints"`
}

type Waypoint struct {
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
	Dist float64 `json:"dist"`
	Dur  float64 `json:"dur"`
	Stop bool    `json:"stop"`
}

type Timetable struct {
	Tours []Tour `json:"tours"`
}

type Tour struct {
	IntervalMinutes int                `json:"intervalMinutes"`
	LastTour        TimeString         `json:"lastTour"`
	Events          []ArrivalDeparture `json:"events"`
}

type ArrivalDeparture struct {
	Arrival   *TimeString `json:"arrival"`
	Departure *TimeString `json:"departure"`
}

type TimeString string
