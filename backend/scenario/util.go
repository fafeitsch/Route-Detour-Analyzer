package scenario

import (
	"regexp"
	"strconv"
)

var numberRegex = regexp.MustCompile("^(\\w+) (\\d+)")

func sortLines(lines []Line) func(i, j int) bool {
	return func(i, j int) bool {
		if lines[i].Name == lines[j].Name {
			return lines[i].Key < lines[j].Key
		}
		matcherI := numberRegex.FindStringSubmatch(lines[i].Name)
		matcherJ := numberRegex.FindStringSubmatch(lines[j].Name)
		if len(matcherI) == 3 && len(matcherJ) == 3 && matcherI[1] == matcherJ[1] {
			if matcherI[2] == matcherJ[2] {
				return lines[i].Name < lines[j].Name
			}
			return mustBeNumber(matcherI[2]) < mustBeNumber(matcherJ[2])
		}
		return lines[i].Name < lines[j].Name
	}
}

func sortStations(stations []Station) func(i, j int) bool {
	return func(i, j int) bool {
		a := stations[i]
		b := stations[j]
		if a.Name == b.Name {
			return a.Key < b.Key
		}
		return a.Name < b.Name
	}
}

func sortTimetables(timetables []Timetable) func(i, j int) bool {
	return func(i, j int) bool {
		a := timetables[i]
		b := timetables[j]
		if a.LineKey != b.LineKey {
			return a.Line().Name < b.Line().Name
		}
		return a.Name < b.Name
	}
}

func sortVehicles(vehicles []Vehicle) func(i, j int) bool {
	return func(i, j int) bool {
		a := vehicles[i]
		b := vehicles[j]
		if a.Name != b.Name {
			return a.Name < b.Name
		}
		return a.Key < b.Key
	}
}

func mustBeNumber(text string) int {
	number, _ := strconv.Atoi(text)
	return number
}
