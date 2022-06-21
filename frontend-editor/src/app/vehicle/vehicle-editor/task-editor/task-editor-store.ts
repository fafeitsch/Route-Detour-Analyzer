/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  LatLng,
  Line,
  NotificationService,
  Task,
  TimeString,
  Waypoint,
} from '../../../shared';
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { RouteService } from '../../../shared/route.service';
import { isDefined } from '../../../shared/utils';

interface State {
  path: Waypoint[];
  startTime: TimeString;
  start: LatLng | undefined;
  end: LatLng | undefined;
  task: Task | undefined;
}

@Injectable()
export class TaskEditorStore extends ComponentStore<State> {
  readonly path$ = super.select((state) => state.path);
  readonly fakeLine$: Observable<Line> = super.select((state) => ({
    path: state.path,
    key: '',
    color: '#000000',
    name: '',
    stops: [],
    stations: [],
    timetable: { key: '', lineKey: '', name: '', tours: [], stations: [] },
  }));
  readonly start$ = super.select((state) => state.start);
  readonly end$ = super.select((state) => state.end);
  readonly task$ = super.select((state) => state.task);

  readonly setStartTime = super.updater((state, startTime: TimeString) => ({
    ...state,
    startTime,
  }));

  readonly setStart = super.updater((state, start: LatLng | undefined) => ({
    ...state,
    start,
  }));

  readonly setEnd = super.updater((state, end: LatLng | undefined) => ({
    ...state,
    end,
  }));

  readonly queryPath$ = super.effect(() =>
    combineLatest([
      this.start$.pipe(isDefined()),
      this.end$.pipe(isDefined()),
    ]).pipe(
      switchMap((path) =>
        this.routeService.queryOsrmRoute(path).pipe(
          tapResponse(
            (result) => super.patchState({ path: result }),
            () =>
              this.notificationService.raiseNotification(
                'Could not' + 'query path between the waypoints.'
              )
          )
        )
      )
    )
  );

  readonly commit$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      map(() =>
        super.get<Task>((state) => ({
          type: 'roaming',
          path: state.path,
          start: state.startTime,
        }))
      ),
      tap((task) => super.patchState({ task }))
    )
  );

  constructor(
    private readonly notificationService: NotificationService,
    private readonly routeService: RouteService
  ) {
    super({
      path: [],
      start: undefined,
      end: undefined,
      task: undefined,
      startTime: '0:00',
    });
  }
}
