package types

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
	Stations []Station  `json:"stations"`
	Stops    []string   `json:"stops"`
	Path     []Waypoint `json:"path"`
	Key      string     `json:"key"`
	Name     string     `json:"name"`
	Color    string     `json:"color"`
}

type AddressResponse struct {
	Name string `json:"name"`
}

type StationUpdate struct {
	ChangedOrAdded []Station `json:"changedOrAdded"`
	Deleted        []string  `json:"deleted"`
}

type Timetable struct {
	Key      string    `json:"key"`
	Name     string    `json:"name"`
	LineKey  string    `json:"lineKey,omitempty"`
	LineName string    `json:"lineName,omitempty"`
	Tours    []Tour    `json:"tours"`
	Stations []Station `json:"stations"`
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

type DetourRequest struct {
	Stations []Station  `json:"stations"`
	Path     []Waypoint `json:"path"`
	Cap      int        `json:"cap"`
}

type DetourResponse struct {
	EmptyResult    bool    `json:"emptyResult"`
	AverageDetour  float64 `json:"averageDetour"`
	BiggestDetour  Detour  `json:"biggestDetour"`
	MedianDetour   Detour  `json:"medianDetour"`
	SmallestDetour Detour  `json:"smallestDetour"`
}

type Detour struct {
	Absolute float64 `json:"absolute"`
	Relative float64 `json:"relative"`
	Source   int     `json:"source"`
	Target   int     `json:"target"`
}
