/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TimetableStore, TourScaffold} from './timetable.store';
import {MatDialog} from '@angular/material/dialog';
import {ArrivalDeparture, Tour} from '../+store/workbench';

@Component({
  selector: 'timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex overflow-auto' },
  providers: [TimetableStore],
})
export class TimetableComponent {
  line$ = this.store.line$;
  durationToNext$ = this.store.durationToNext$;
  tours$ = this.store.tours$;
  dirty$ = this.store.dirty$;

  selectedTourIndex: number | undefined = undefined;
  selectedTour: Tour | undefined = undefined;

  constructor(private readonly store: TimetableStore, private readonly dialog: MatDialog) {}

  editTour(tour: TourScaffold) {
    if (!this.selectedTour) {
      this.store.addTour$(tour);
    } else if (this.selectedTourIndex !== undefined) {
      this.store.modifyTour$({ scaffold: tour, index: this.selectedTourIndex });
      this.selectedTourIndex = undefined;
      this.selectedTour = undefined;
    }
  }

  modifyTime(index: number, eventIndex: number, changedEvent: ArrivalDeparture) {
    this.store.modifyTime$({ index, eventIndex, changedEvent });
  }

  selectTour(tour: Tour, index: number) {
    this.selectedTourIndex = this.selectedTourIndex === index ? undefined : index;
    this.selectedTour = this.selectedTourIndex === undefined ? undefined : tour;
  }

  commit() {
    this.store.commit$();
  }

  deleteTour() {
    if (this.selectedTourIndex === undefined) {
      return;
    }
    this.store.deleteTour$(this.selectedTourIndex);
    this.selectedTourIndex = undefined;
    this.selectedTour = undefined;
  }

  trackByUuid(index: number, { uuid }: Tour & { uuid: string }) {
    return uuid;
  }
}
