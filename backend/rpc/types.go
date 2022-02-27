package rpc

type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type Station struct {
	Lat        float64          `json:"lat"`
	Lng        float64          `json:"lng"`
	Key        string           `json:"key"`
	Name       string           `json:"name"`
	IsWaypoint bool             `json:"isWaypoint"`
	Lines      []LineIdentifier `json:"lines"`
}

type Waypoint struct {
	Lat  float64  `json:"lat"`
	Lng  float64  `json:"lng"`
	Dist *float64 `json:"dist,omitempty"`
	Dur  *float64 `json:"dur,omitempty"`
	Stop bool     `json:"stop,omitempty"`
}

type LineIdentifier struct {
	Key  string `json:"key"`
	Name string `json:"name"`
}

type Line struct {
	Stations  []Station  `json:"stations"`
	Stops     []string   `json:"stops"`
	Path      []Waypoint `json:"path"`
	Key       string     `json:"key"`
	Name      string     `json:"name"`
	Color     string     `json:"color"`
	Timetable Timetable  `json:"timetable"`
}

type AddressResponse struct {
	Name string `json:"name"`
}

type StationUpdate struct {
	ChangedOrAdded []Station `json:"changedOrAdded"`
	Deleted        []string  `json:"deleted"`
}

type Timetable struct {
	Tours []Tour `json:"tours"`
}

type Tour struct {
	IntervalMinutes int                `json:"intervalMinutes"`
	LastTour        string             `json:"lastTour"`
	Events          []ArrivalDeparture `json:"events"`
}

type ArrivalDeparture struct {
	Arrival   *string `json:"arrival"`
	Departure *string `json:"departure"`
}
