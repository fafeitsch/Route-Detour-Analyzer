package persistence

type Scenario struct {
	Stations   []Station   `json:"stations"`
	Lines      []Line      `json:"lines"`
	Timetables []Timetable `json:"timetable,omitempty"`
	Vehicles   []Vehicle   `json:"vehicles"`
	Center     Center      `json:"center"`
}

type Center struct {
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
	Zoom int     `json:"zoom"`
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
	Key      string   `json:"key"`
	Line     string   `json:"line,omitempty"`
	Name     string   `json:"name"`
	Tours    []Tour   `json:"tours,omitempty"`
	Stations []string `json:"stations"`
}

type Tour struct {
	IntervalMinutes int                `json:"intervalMinutes"`
	LastTour        string             `json:"lastTour"`
	Events          []ArrivalDeparture `json:"events"`
}

type ArrivalDeparture struct {
	Arrival   string `json:"arrival,omitempty"`
	Departure string `json:"departure,omitempty"`
}

type Vehicle struct {
	Name     string `json:"name"`
	Key      string `json:"key"`
	Position string `json:"position"`
	Tasks    []Task `json:"tasks"`
}

type Task struct {
	Start string `json:"start"`
	Type  string `json:"type"`
	// Free roaming properties
	Path *Path `json:"path,omitempty"`
	// Line/Timetable properties
	TimetableKey *string `json:"timetableKey,omitempty"`
	PathIndex    *int    `json:"pathIndex,omitempty"`
}
