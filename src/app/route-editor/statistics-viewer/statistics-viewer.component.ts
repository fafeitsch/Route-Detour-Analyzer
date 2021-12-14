/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StatisticsViewerStore } from './statistics-viewer.store';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'statistics-viewer',
  templateUrl: './statistics-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StatisticsViewerStore],
})
export class StatisticsViewerComponent {
  averageDetour$ = this.store.getAverageDetour$;
  smallestDetour$ = this.store.getSmallestDetour$;
  medianDetour$ = this.store.getMedianDetour$;
  biggestDetour$ = this.store.getBiggestDetour$;
  lineColor$ = this.store.lineColor$;
  consideredStops$ = this.store.consideredStops$;
  numberOfTours$ = this.store.numberOfTours$;

  capControl = new FormControl(0);

  constructor(private readonly store: StatisticsViewerStore) {
    this.store.setCap$(this.capControl.valueChanges);
  }
}
