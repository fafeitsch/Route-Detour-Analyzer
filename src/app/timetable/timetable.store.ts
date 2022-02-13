/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import {
  addMinutes,
  ArrivalDeparture,
  Domain,
  lines,
  lineSavedInTimetableEditor,
  TimeString,
  Tour,
  Workbench,
} from '../+store/workbench';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { RouteService } from '../route.service';
import { combineLatest, Observable } from 'rxjs';
import { uuid } from '../shared/utils';
import Line = Domain.Line;

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
export class TimetableStore extends ComponentStore<State> {
  readonly line$ = super.select(state => state.line);
  readonly tours$ = super.select(state => state.tours);
  readonly dirty$ = super.select(state => state.dirty);

  readonly durationToNext$ = super
    .select(state => state.line)
    .pipe(
      filter(line => !!line),
      map(line => line!.path),
      map(path => this.routeService.buildRouteLegs(path)),
      map(legs => legs.map(leg => Math.ceil(Math.max(1, leg.duration / 60))))
    );

  readonly deleteTour$ = super.updater((state, index: number) => ({
    ...state,
    tours: state.tours.filter((_, i) => i !== index),
    dirty: true,
  }));

  readonly modifyTime$ = super.updater(
    (
      state,
      { index, eventIndex, changedEvent }: { index: number; eventIndex: number; changedEvent: ArrivalDeparture }
    ) => ({
      ...state,
      dirty: true,
      tours: state.tours.map((tour, i) =>
        i != index
          ? tour
          : {
              ...tour,
              events: tour.events.map((event, ii) => (ii === eventIndex ? changedEvent : event)),
            }
      ),
    })
  );

  readonly selectLineFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map(params => params.get('line')),
      switchMap(lineName =>
        this.store.select(lines).pipe(
          map(lines => lines.find(line => line.name === lineName)),
          map(line => (!line ? undefined : { ...line })),
          tap(line => super.patchState({ line })),
          tap(line =>
            super.patchState({
              tours: line
                ? JSON.parse(
                    JSON.stringify(
                      line.timetable.tours.map(tour => ({
                        ...tour,
                        uuid: uuid(),
                      }))
                    )
                  )
                : { tours: [] },
            })
          )
        )
      )
    )
  );

  readonly addTour$ = super.effect((scaffold$: Observable<TourScaffold>) =>
    scaffold$.pipe(
      switchMap(scaffold =>
        this.buildTour(scaffold).pipe(
          tap(newTour =>
            super.patchState(state => ({
              ...state,
              tours: [...state.tours, newTour],
            }))
          ),
          tap(() => super.patchState({ dirty: true }))
        )
      )
    )
  );

  readonly modifyTour$ = super.effect((tour$: Observable<{ scaffold: TourScaffold; index: number }>) =>
    tour$.pipe(
      switchMap(tour =>
        this.tours$.pipe(
          take(1),
          map(tours => tours[tour.index]),
          map(t => ({ ...t, lastTour: tour.scaffold.lastTour, intervalMinutes: tour.scaffold.intervalMinutes })),
          tap(newTour =>
            super.patchState(state => ({
              ...state,
              tours: state.tours.map((t, index) => (index === tour.index ? newTour : t)),
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
        combineLatest([this.line$, this.tours$]).pipe(
          take(1),
          filter(([line, _]) => !!line),
          map(([line, tours]) => ({
            ...line!,
            timetable: { tours: tours.map(tour => ({ ...tour })) },
          })),
          tap((line: Line) =>
            //@ts-ignore
            line.timetable.tours.forEach(tour => delete tour['uuid'])
          ),
          tap(line => this.store.dispatch(lineSavedInTimetableEditor({ oldName: line.name, line }))),
          tap(() => super.patchState({ dirty: false }))
        )
      )
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store<Workbench>,
    private readonly routeService: RouteService
  ) {
    super({ line: undefined, tours: [], dirty: false });
  }

  private buildTour(scaffold: TourScaffold): Observable<Tour & { uuid: string }> {
    return this.durationToNext$.pipe(
      take(1),
      map((durations: number[]) => {
        const events: ArrivalDeparture[] = [{ departure: scaffold.start }];
        durations.forEach(duration => {
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
      })
    );
  }
}
