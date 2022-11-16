package vehicle

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

type timeString string

func convertToTimeStr(s string) (timeString, error) {
	regex := regexp.MustCompile("(\\d?\\d):(\\d\\d)")
	match := regex.FindAllStringSubmatch(s, -1)
	errorMessage := fmt.Errorf("\"%s\" is no valid timestring. must be of format %s", s, regex.String())
	if match == nil || len(match) != 1 {
		return "", errorMessage
	}
	hours, _ := strconv.Atoi(match[0][0])
	if hours > 23 {
		return "", fmt.Errorf("\"%s\" is not a valid time because the hours are greater than 23", s)
	}
	minutes, _ := strconv.Atoi(match[0][1])
	if minutes > 60 {
		return "", fmt.Errorf("\"%s\" is not a valid time because the minutes are greater than 60", s)
	}
	return timeString(s), nil
}

func (t timeString) parseTime() (int, int) {
	split := strings.Split(string(t), ":")
	hours, _ := strconv.Atoi(split[0])
	minutes, _ := strconv.Atoi(split[1])
	return hours, minutes
}

func (t timeString) toMinutes() int {
	hours, minutes := t.parseTime()
	return hours*60 + minutes
}

func (t timeString) add(minutes int) timeString {
	minutes = t.toMinutes() + minutes
	hours := minutes / 60
	minutes = minutes - hours*60
	return timeString(fmt.Sprintf("%02d:%02d", hours, minutes))
}
