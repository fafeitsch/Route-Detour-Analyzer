/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  addMinutes,
  computeTime,
  Line,
  LinesService,
  NotificationService,
  Task,
  TimeString,
  Timetable,
  Tour,
} from '../../../../shared';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';
import { isDefined } from '../../../../shared/utils';
import { TimetableService } from '../../../../shared/timetable.service';
import { Observable } from 'rxjs';

interface State {
  line: Line | undefined;
  lines: Line[];
  timetables: Timetable[];
  timetable: Timetable | undefined;
  tours: TimeString[];
  tour: TimeString | undefined;
}

@Injectable()
export class TourSelectorStore extends ComponentStore<State> {
  line$ = super.select((state) => state.line);
  lines$ = super.select((state) => state.lines);
  timetables$ = super.select((state) => state.timetables);
  timetable$ = super.select((state) => state.timetable);
  tours$ = super.select((state) => state.tours);
  tour$ = super.select((state) => state.tour);
  task$: Observable<Task | undefined> = super.select((state) => {
    if (!state.line || !state.timetable || !state.tour) {
      return undefined;
    }
    return {
      start: state.tour,
      type: 'line',
      timetableKey: state.timetable.key,
      pathIndex: 0,
    };
  });

  selectLine$ = super.updater((state, line: Line) => ({
    ...state,
    line,
    timetables: [],
    timetable: undefined,
    tours: [],
    tour: undefined,
  }));
  selectTimetable$ = super.updater((state, timetable: Timetable) => ({
    ...state,
    timetable,
    tours: [],
    tour: undefined,
  }));
  selectTour$ = super.updater((state, tour: TimeString) => ({
    ...state,
    tour,
  }));

  loadLines$ = super.effect(() =>
    this.linesService.getLines().pipe(
      tap((x) => console.log(x)),
      tapResponse(
        (lines) => super.patchState({ lines }),
        () =>
          this.notificationService.raiseNotification(
            'Could not load lines',
            'error'
          )
      )
    )
  );

  loadTimetables$ = super.effect(() =>
    this.line$.pipe(
      tap(() => super.patchState({ timetables: [] })),
      isDefined(),
      switchMap((line) =>
        this.timetableService.getTimetablesForLine(line.key).pipe(
          tapResponse(
            (timetables) => super.patchState({ timetables }),
            () =>
              this.notificationService.raiseNotification(
                `Could not load timetables for line "${line.name}".`,
                'error'
              )
          )
        )
      )
    )
  );

  loadTours$ = super.effect(() =>
    this.timetable$.pipe(
      tap(() => super.patchState({ tours: [] })),
      isDefined(),
      switchMap((timetable) =>
        this.timetableService.getTimetable(timetable.key).pipe(
          tapResponse(
            (result) =>
              super.patchState({ tours: this.expandTours(result.tours) }),
            () =>
              this.notificationService.raiseNotification(
                `Could not load tours for timetable "${timetable.name}".`,
                'error'
              )
          )
        )
      )
    )
  );

  constructor(
    private readonly linesService: LinesService,
    private readonly notificationService: NotificationService,
    private readonly timetableService: TimetableService
  ) {
    super({
      line: undefined,
      lines: [],
      timetables: [],
      timetable: undefined,
      tour: undefined,
      tours: [],
    });
  }

  private expandTours(tours: Tour[]): TimeString[] {
    return tours
      .map((tour) => {
        if (!tour.intervalMinutes || !tour.lastTour) {
          return [tour.events[0].departure!];
        } else {
          const expanded: TimeString[] = [];
          let current: TimeString = tour.events[0].departure!;
          while (computeTime(current) < computeTime(tour.lastTour)) {
            expanded.push(current);
            current = addMinutes(current, tour.intervalMinutes);
          }
          return expanded;
        }
      })
      .reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, [] as TimeString[]);
  }
}
