package persistence

type Scenario struct {
	Stations   []Station   `json:"stations"`
	Lines      []Line      `json:"lines"`
	Timetables []Timetable `json:"timetable,omitempty"`
}

type Station struct {
	Key        string `json:"key"`
	Name       string `json:"name"`
	LatLng     string `json:"latLng"`
	IsWaypoint bool   `json:"isWaypoint"`
}

type Line struct {
	Stops []string `json:"stops,omitempty"`
	Path  Path     `json:"path"`
	Name  string   `json:"name"`
	Color string   `json:"color"`
	Key   string   `json:"key"`
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
	Key   string  `json:"key"`
	Line  *string `json:"line,omitempty"`
	Name  string  `json:"name"`
	Tours []Tour  `json:"tours,omitempty"`
}

type Tour struct {
	IntervalMinutes int                `json:"intervalMinutes"`
	LastTour        string             `json:"lastTour"`
	Events          []ArrivalDeparture `json:"events"`
}

type ArrivalDeparture struct {
	Arrival   string `json:"arrival"`
	Departure string `json:"departure"`
}
