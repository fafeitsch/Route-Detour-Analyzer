package vehicle

import "backend/persistence"

func findNextTourAfter(tour []persistence.Tour, aTime timeString) []timeString {
	tours := expandTours(tour)
	var result []timeString = nil
	min := 24 * 60
	for key, value := range tours {
		diff := key.toMinutes() - aTime.toMinutes()
		if diff >= 0 && diff < min {
			min = diff
			result = value
		}
	}
	return result
}

func expandTours(tours []persistence.Tour) map[timeString][]timeString {
	result := make(map[timeString][]timeString)
	for _, tour := range tours {
		end := timeString(tour.Events[0].Departure).add(-1)
		if tour.LastTour != "" {
			end = timeString(tour.LastTour)
		}
		end = timeString(tour.LastTour)
		currentTime := timeString(tour.Events[0].Departure)
		difference := 0
		for ok := true; ok; ok = currentTime.toMinutes() <= end.toMinutes() {
			departures := make([]timeString, 0, len(tour.Events))
			for _, event := range tour.Events[0 : len(tour.Events)-1] {
				departures = append(departures, timeString(event.Departure).add(difference))
			}
			result[currentTime] = departures
			difference = difference + tour.IntervalMinutes
			currentTime = currentTime.add(tour.IntervalMinutes)
		}
	}
	return result
}
