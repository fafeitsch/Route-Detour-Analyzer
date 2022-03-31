/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Pipe, PipeTransform } from '@angular/core';
import { ArrivalDeparture, Tour } from '../shared';

@Pipe({
  name: 'transformTimetable',
})
export class TransformTimetablePipe implements PipeTransform {
  transform(tours: Tour[], index: number): ArrivalDeparture[] {
    if (!tours || index === undefined) {
      return [];
    }
    const result: ArrivalDeparture[] = [];
    tours.forEach(
      (tour, tourIndex) => (result[tourIndex] = tour.events[index])
    );
    return result;
  }
}
