/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  distinct,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { RouteService } from '../../shared/route.service';
import { combineLatest, Observable } from 'rxjs';
import { isDefined, uuid } from '../../shared/utils';
import {
  addMinutes,
  ArrivalDeparture,
  Line,
  LinesService,
  NotificationService,
  TimeString,
  Tour,
} from '../../shared';
import { TimetableService } from '../../shared/timetable.service';

export interface TourScaffold {
  start: TimeString;
  intervalMinutes?: number;
  lastTour?: TimeString;
}

interface State {
  line: Line | undefined;
  tours: (Tour & { uuid: string })[];
  dirty: boolean;
}

@Injectable()
export class TimetableEditorStore extends ComponentStore<State> {
  readonly line$ = super.select((state) => state.line);
  readonly tours$ = super.select((state) => state.tours);
  readonly dirty$ = super.select((state) => state.dirty);

  readonly durationToNext$ = super
    .select((state) => state.line)
    .pipe(
      filter((line) => !!line),
      map((line) => line!.path),
      map((path) => this.routeService.buildRouteLegs(path)),
      map((legs) =>
        legs.map((leg) => Math.ceil(Math.max(1, leg.duration / 60)))
      )
    );

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

  readonly selectTimetableFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map((params) => params.get('timetable')),
      isDefined(),
      distinctUntilChanged(),
      switchMap((key) =>
        this.timetableService.getTimetable(key).pipe(
          tapResponse(
            () => void 0,
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

  readonly addTour$ = super.effect((scaffold$: Observable<TourScaffold>) =>
    scaffold$.pipe(
      switchMap((scaffold) =>
        this.buildTour(scaffold).pipe(
          tap((newTour) =>
            super.patchState((state) => ({
              ...state,
              tours: [...state.tours, newTour],
            }))
          ),
          tap(() => super.patchState({ dirty: true }))
        )
      )
    )
  );

  readonly modifyTour$ = super.effect(
    (tour$: Observable<{ scaffold: TourScaffold; index: number }>) =>
      tour$.pipe(
        switchMap((tour) =>
          this.tours$.pipe(
            take(1),
            map((tours) => tours[tour.index]),
            map((t) => ({
              ...t,
              lastTour: tour.scaffold.lastTour,
              intervalMinutes: tour.scaffold.intervalMinutes,
            })),
            tap((newTour) =>
              super.patchState((state) => ({
                ...state,
                tours: state.tours.map((t, index) =>
                  index === tour.index ? newTour : t
                ),
              }))
            ),
            tap(() => super.patchState({ dirty: true }))
          )
        )
      )
  );

  readonly commit$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() =>
        combineLatest([this.line$.pipe(isDefined()), this.tours$]).pipe(
          take(1),
          tap((x) => console.log(x)),
          // @ts-ignore
          map(([line, tours]) => ({
            ...line,
            timetable: { tours: tours.map((tour) => ({ ...tour })) },
          })),
          tap((line: Line) =>
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/dot-notation,dot-notation
            line.timetable.tours.forEach((tour) => delete tour['uuid'])
          ),
          switchMap((line) =>
            this.lineService.saveLine(line).pipe(
              tapResponse(
                () => {
                  super.patchState({ dirty: false });
                  this.notificationService.raiseNotification(
                    'Line saved successfully',
                    'success'
                  );
                },
                (err) =>
                  this.notificationService.raiseNotification(
                    'Line could not be saved: ' + err,
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
    private readonly lineService: LinesService,
    private readonly notificationService: NotificationService,
    private readonly timetableService: TimetableService
  ) {
    super({ line: undefined, tours: [], dirty: false });
  }

  private buildTour(
    scaffold: TourScaffold
  ): Observable<Tour & { uuid: string }> {
    return this.durationToNext$.pipe(
      take(1),
      map((durations: number[]) => {
        const events: ArrivalDeparture[] = [{ departure: scaffold.start }];
        durations.forEach((duration) => {
          events.push({
            departure: addMinutes(
              events[events.length - 1].departure!,
              duration
            ),
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
      })
    );
  }
}
