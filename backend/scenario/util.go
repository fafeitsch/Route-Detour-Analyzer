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

func mustBeNumber(text string) int {
	number, _ := strconv.Atoi(text)
	return number
}
