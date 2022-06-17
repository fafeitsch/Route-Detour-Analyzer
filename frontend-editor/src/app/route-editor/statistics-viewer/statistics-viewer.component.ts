/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { StatisticsViewerStore } from './statistics-viewer.store';
import { FormControl } from '@angular/forms';
import { Station } from '../../shared';
import { map } from 'rxjs/operators';

@Component({
  selector: 'statistics-viewer',
  templateUrl: './statistics-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StatisticsViewerStore],
})
export class StatisticsViewerComponent {
  @Input() focusedStop: Station | undefined = undefined;

  @Output() focusStop = new EventEmitter<Station | undefined>();
  @Output() centerStop = new EventEmitter<Station>();

  averageDetour$ = this.store.getAverageDetour$;
  smallestDetour$ = this.store.getSmallestDetour$;
  medianDetour$ = this.store.getMedianDetour$;
  biggestDetour$ = this.store.getBiggestDetour$;
  lineColor$ = this.store.lineColor$;
  consideredStops$ = this.store.consideredStops$;
  numberOfTours$ = this.store.numberOfTours$;
  capControl = new FormControl(0);

  constructor(private readonly store: StatisticsViewerStore) {
    this.store.setCap$(
      this.capControl.valueChanges.pipe(map((value) => value || 0))
    );
  }

  stopFocused(stop: Station | undefined) {
    this.focusStop.emit(stop);
  }

  stopClicked(stop: Station) {
    this.centerStop.emit(stop);
  }
}
