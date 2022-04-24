/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Timetable } from '../../shared';
import { TimetableStore } from '../timetable.store';

@Component({
  selector: 'timetable-list',
  styleUrls: ['timetable-list.component.scss'],
  templateUrl: './timetable-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimetableListComponent {
  lineKey$ = this.store.lineKey$;
  timetables$ = this.store.timetables$;

  constructor(private readonly store: TimetableStore) {}

  addTimetable() {
    this.store.createTimetable$();
  }

  saveTimetableName(name: string, timetable: Timetable) {
    this.store.saveTimetable$({ ...timetable, name });
  }

  deleteTimetable(key: string) {
    this.store.deleteTimetable$(key);
  }
}
