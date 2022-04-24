/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Line, LinesService, NotificationService, Timetable } from '../shared';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { TimetableService } from '../shared/timetable.service';
import { distinct, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { isDefined } from '../shared/utils';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

interface State {
  timetables: Timetable[];
  line: Line | undefined;
}

@Injectable()
export class TimetableStore extends ComponentStore<State> {
  readonly timetables$ = super.select((state) => state.timetables);
  readonly lineKey$ = super.select((state) => state.line?.key);
  readonly line$ = super.select((state) => state.line);

  readonly loadTimetables = super.effect(() =>
    this.lineKey$.pipe(
      tap(() => super.patchState({ timetables: [] })),
      isDefined(),
      switchMap((key) =>
        this.service.getTimetablesForLine(key).pipe(
          tapResponse(
            (timetables) => super.patchState({ timetables }),
            (err) => {
              this.notificationService.raiseNotification(
                'Could not load timetables: ' + err,
                'error'
              );
            }
          )
        )
      )
    )
  );

  readonly createTimetable$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      withLatestFrom(this.line$.pipe(isDefined())),
      switchMap(([, line]) =>
        this.service
          .saveTimetable({
            lineKey: line.key,
            stations: line.stations,
          })
          .pipe(
            tapResponse(
              (timetable) => {
                this.notificationService.raiseNotification(
                  'Timetable created',
                  'success'
                );
                super.patchState((state) => ({
                  ...state,
                  timetables: [...state.timetables, timetable],
                }));
              },
              (err) =>
                this.notificationService.raiseNotification(
                  'Could not create timetable: ' + err,
                  'error'
                )
            )
          )
      )
    )
  );

  readonly saveTimetable$ = super.effect((timetable$: Observable<Timetable>) =>
    timetable$.pipe(
      switchMap((timetable) =>
        this.service.saveTimetable(timetable).pipe(
          tapResponse(
            (result) => {
              this.notificationService.raiseNotification(
                'Timetable saved',
                'success'
              );
              super.patchState((state) => ({
                ...state,
                timetables: state.timetables.map((tt) =>
                  tt.key === result.key ? result : tt
                ),
              }));
            },
            (err) =>
              this.notificationService.raiseNotification(
                'Could not save timetable: ' + err,
                'error'
              )
          )
        )
      )
    )
  );

  readonly deleteTimetable$ = super.effect((key$: Observable<string>) =>
    key$.pipe(
      switchMap((key) =>
        this.service.deleteTimetable(key).pipe(
          tapResponse(
            () => {
              super.patchState((state) => ({
                ...state,
                timetables: state.timetables.filter((tt) => tt.key !== key),
              }));
              this.notificationService.raiseNotification(
                'Timetable deleted successfully.',
                'success'
              );
            },
            (err) =>
              this.notificationService.raiseNotification(
                'Could not delete timetable: ' + err,
                'error'
              )
          )
        )
      )
    )
  );

  readonly selectLineFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map((params) => params.get('line')),
      isDefined(),
      distinct(),
      switchMap((lineKey) =>
        this.lineService.getLine(lineKey).pipe(
          tapResponse(
            (line) => super.patchState({ line }),
            (err) =>
              this.notificationService.raiseNotification(
                'Could not fetch line: ' + err
              )
          )
        )
      )
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: TimetableService,
    private readonly notificationService: NotificationService,
    private readonly lineService: LinesService
  ) {
    super({ timetables: [], line: undefined });
  }
}
