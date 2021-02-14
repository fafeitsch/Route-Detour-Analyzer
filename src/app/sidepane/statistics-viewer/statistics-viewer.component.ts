/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EMPTY } from 'rxjs';
import { StatisticsViewerStore } from './statistics-viewer.store';

@Component({
  selector: 'statistics-viewer',
  templateUrl: './statistics-viewer.component.html',
  styleUrls: ['./statistics-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StatisticsViewerStore],
})
export class StatisticsViewerComponent {
  originalDistance$ = this.store.getTotalDistance$;
  averageDetour$ = this.store.getAverageDetour$;
  smallestDetour$ = this.store.getSmallestDetour$;
  medianDetour$ = this.store.getMedianDetour$;
  biggestDetour$ = this.store.getBiggestDetour$;

  constructor(private readonly store: StatisticsViewerStore) {}
}
