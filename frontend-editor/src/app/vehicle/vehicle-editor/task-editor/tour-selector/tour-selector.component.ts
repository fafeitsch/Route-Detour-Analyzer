import {
  ChangeDetectionStrategy,
  Component,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { TourSelectorStore } from './tour-selector.store';
import { debounceTime, map } from 'rxjs/operators';
import { Line, Task, TimeString, Timetable } from '../../../../shared';
import { combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'tour-selector',
  templateUrl: './tour-selector.component.html',
  styleUrls: ['./tour-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'tour-selector' },
  providers: [TourSelectorStore],
})
export class TourSelectorComponent {
  lines$ = this.store.lines$;
  selectedLine$ = this.store.line$;
  lineSelected$ = this.store.line$.pipe(map((line) => !!line));
  timetables$ = this.store.timetables$;
  timetableSelected$ = this.store.timetable$.pipe(
    map((timetable) => !!timetable)
  );
  tours$ = this.store.tours$;
  tourSelected$ = this.store.tour$.pipe(map((tour) => !!tour));
  step$ = combineLatest([
    this.store.line$,
    this.store.timetable$,
    this.store.tour$,
  ]).pipe(
    debounceTime(100),
    map((objects: (unknown | undefined)[]) => objects.indexOf(undefined)),
    map((index) => (index === -1 ? 2 : index))
  );

  @Output() selectTask: Observable<Task | undefined> = this.store.task$;

  constructor(private readonly store: TourSelectorStore) {}

  selectLine(line: Line) {
    this.store.selectLine$(line);
  }

  selectTimetable(timetable: Timetable) {
    this.store.selectTimetable$(timetable);
  }

  selectTour(tour: TimeString) {
    this.store.selectTour$(tour);
  }
}
