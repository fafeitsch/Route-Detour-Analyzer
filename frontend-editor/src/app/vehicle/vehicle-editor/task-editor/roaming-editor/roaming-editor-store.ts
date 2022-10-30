/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  LatLng,
  Line,
  NotificationService,
  Task,
  TimeString,
  Waypoint,
} from '../../../../shared';
import { isDefined } from '../../../../shared/utils';
import { RouteService } from '../../../../shared/route.service';

interface State {
  path: Waypoint[];
  startTime: TimeString;
  start: LatLng | undefined;
  end: LatLng | undefined;
}

@Injectable()
export class RoamingEditorStore extends ComponentStore<State> {
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
  readonly task$: Observable<Task | undefined> = super.select((state) => {
    console.log(!state.path || !state.startTime);
    if (!state.path || !state.startTime) {
      return undefined;
    }
    return { type: 'roaming', start: state.startTime, path: state.path };
  });

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
                'Could not query path between the waypoints.'
              )
          )
        )
      )
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
      startTime: '0:00',
    });
  }
}
