/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { RouteService } from '../../shared/route.service';
import { combineLatest, Observable } from 'rxjs';
import { isDefined, uuid } from '../../shared/utils';
import {
  addMinutes,
  ArrivalDeparture,
  Line,
  NotificationService,
  TimeString,
  Timetable,
  Tour,
} from '../../shared';
import { TimetableService } from '../../shared/timetable.service';

export interface TourScaffold {
  start: TimeString;
  intervalMinutes?: number;
  lastTour?: TimeString;
}

interface State {
  timetable: Timetable;
  tours: (Tour & { uuid: string })[];
  line: Line | undefined;
  dirty: boolean;
  durationToNext: number[];
}

@Injectable()
export class TimetableEditorStore extends ComponentStore<State> {
  readonly line$ = super.select((state) => state.line);
  readonly clean$ = super.select((state) => !state.dirty);
  readonly stations$ = super.select((state) =>
    (state.timetable?.stations || []).map((station, index) => ({
      ...station,
      toNext:
        state.durationToNext && state.durationToNext[index]
          ? state.durationToNext[index]
          : undefined,
    }))
  );
  readonly timetable$ = super.select((state) => state.timetable);
  readonly durationToNext$ = super.select((state) => state.durationToNext);
  readonly tours$ = super.select((state) => state.tours);

  readonly setLine$ = super.updater((state, line: Line | undefined) => ({
    ...state,
    line,
  }));

  readonly deleteTour$ = super.updater((state, index: number) => ({
    ...state,
    tours: state.tours.filter((_, i) => i !== index),
    dirty: true,
  }));

  readonly modifyTime$ = super.updater(
    (
      state,
      {
        index,
        eventIndex,
        changedEvent,
      }: { index: number; eventIndex: number; changedEvent: ArrivalDeparture }
    ) => ({
      ...state,
      dirty: true,
      tours: state.tours.map((tour, i) =>
        i !== index
          ? tour
          : {
              ...tour,
              events: tour.events.map((event, ii) =>
                ii === eventIndex ? changedEvent : event
              ),
            }
      ),
    })
  );

  readonly addTour$ = super.updater((state, scaffold: TourScaffold) => ({
    ...state,
    dirty: true,
    tours: [...state.tours, this.buildTour(scaffold, state.durationToNext)],
  }));

  readonly modifyTour$ = super.updater(
    (
      state,
      { scaffold, index }: { scaffold: TourScaffold; index: number }
    ) => ({
      ...state,
      dirty: true,
      tours: state.tours.map((t, i) =>
        index === i
          ? {
              ...t,
              lastTour: scaffold.lastTour,
              intervalMinutes: scaffold.intervalMinutes,
            }
          : t
      ),
    })
  );

  readonly selectTimetableFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map((params) => params.get('timetable')),
      isDefined(),
      distinctUntilChanged(),
      switchMap((key) =>
        this.timetableService.getTimetable(key).pipe(
          tapResponse(
            (timetable) =>
              super.patchState({
                timetable,
                tours: timetable.tours.map((tour) => ({
                  ...tour,
                  uuid: uuid(),
                })),
              }),
            (err) =>
              this.notificationService.raiseNotification(
                'Could not fetch timetable: ' + err,
                'error'
              )
          )
        )
      )
    )
  );

  readonly loadDurationToNext$ = super.effect(() =>
    this.timetable$.pipe(
      isDefined(),
      map((timetable) => timetable.stations),
      switchMap((stations) =>
        this.routeService.queryOsrmRoute(stations).pipe(
          tapResponse(
            (path) => {
              const legs = this.routeService.buildRouteLegs(path);
              const durationToNext = legs.map((leg) =>
                Math.ceil(Math.max(1, leg.duration / 60))
              );
              super.patchState({ durationToNext });
            },
            () => {
              this.notificationService.raiseNotification(
                'Could not fetch travel times between stations of timeable',
                'error'
              );
              super.patchState({ durationToNext: undefined });
            }
          )
        )
      )
    )
  );

  readonly commit$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() =>
        combineLatest([this.timetable$, this.tours$]).pipe(
          take(1),
          map(([timetable, tours]) => ({ ...timetable, tours })),
          switchMap((timetable) =>
            this.timetableService.saveTimetable(timetable).pipe(
              tapResponse(
                () => {
                  super.patchState({ dirty: false });
                  this.notificationService.raiseNotification(
                    'Timetable routes saved.',
                    'success'
                  );
                },
                () =>
                  this.notificationService.raiseNotification(
                    'Could not save timetable',
                    'error'
                  )
              )
            )
          )
        )
      )
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly routeService: RouteService,
    private readonly notificationService: NotificationService,
    private readonly timetableService: TimetableService
  ) {
    super({
      dirty: false,
      timetable: {
        tours: [],
        stations: [],
        lineKey: undefined!,
        key: undefined!,
        name: '',
      },
      line: undefined,
      durationToNext: [],
      tours: [],
    });
  }

  private buildTour(
    scaffold: TourScaffold,
    durations: number[]
  ): Tour & { uuid: string } {
    const events: ArrivalDeparture[] = [{ departure: scaffold.start }];
    durations.forEach((duration) => {
      events.push({
        departure: addMinutes(events[events.length - 1].departure!, duration),
      });
    });
    events[events.length - 1].arrival = events[events.length - 1].departure;
    events[events.length - 1].departure = undefined;
    return {
      uuid: uuid(),
      events,
      lastTour: scaffold.lastTour,
      intervalMinutes: scaffold.intervalMinutes,
    };
  }
}
