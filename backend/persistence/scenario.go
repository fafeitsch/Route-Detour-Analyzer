package persistence

type Scenario struct {
	Stations []Station `json:"stations"`
	Lines    []Line    `json:"lines"`
}

type Station struct {
	Key        string `json:"key"`
	Name       string `json:"name"`
	LatLng     string `json:"latLng"`
	IsWaypoint bool   `json:"isWaypoint"`
}

type Line struct {
	Stops     []string  `json:"stops,omitempty"`
	Path      Path      `json:"path"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	Key       string    `json:"key"`
	Timetable Timetable `json:"timetable,omitempty"`
}

type Path struct {
	Geometry string      `json:"geometry"`
	Meta     []MetaCoord `json:"meta"`
}

type MetaCoord struct {
	Dist float64 `json:"dist,omitempty"`
	Dur  float64 `json:"dur,omitempty"`
	Stop bool    `json:"stop,omitempty"`
}

type Timetable struct {
	Tours []Tour `json:"tours,omitempty"`
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
