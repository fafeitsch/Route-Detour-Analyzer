/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { LatLng, Line, lines, lineSavedInRouteEditor, Workbench } from '../+store/workbench';
import { Store } from '@ngrx/store';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { RouteService, Stop } from '../route.service';

interface State {
  line: Line;
  originalLineName: string;
  lineError: string | undefined;
  uncommitedChanges: boolean;
  focusedStop: number | undefined;
}

@Injectable()
export class RouteEditorStore extends ComponentStore<State> {
  readonly line$ = super.select(state => state.line);
  readonly totalDistance$ = this.line$.pipe(
    map(line => line.path?.distanceTable || []),
    map(table => (table.length === 0 ? 0 : table[0][table.length - 1]))
  );
  readonly focusedStop$ = super.select(state => state.focusedStop);
  readonly uncommitedChanges$ = super.select(state => state.uncommitedChanges);
  readonly lineError$ = super.select(state => state.lineError);
  readonly originalLineName$ = super.select(state => state.originalLineName);

  readonly setFocusedStop$ = super.updater((state, focusedStop: number | undefined) => ({
    ...state,
    focusedStop,
  }));

  readonly renameStop$ = super.updater((state, [index, name]: [number, string]) => {
    return {
      ...state,
      uncommitedChanges: true,
      line: {
        ...state.line,
        stops: state.line.stops.map((stop, i) => (i === index ? { ...stop, name } : stop)),
      },
    };
  });

  readonly selectLineFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map(params => params.get('line')),
      switchMap(lineName => this.store.select(lines).pipe(map(lines => lines.find(line => line.name === lineName)))),
      filter(line => !!line),
      map(line => ({ ...line! })),
      tap(line => super.patchState({ line, originalLineName: line.name }))
    )
  );

  readonly toggleStopOfLine$ = super.effect((index$: Observable<number>) =>
    index$.pipe(
      tap(() => super.patchState({ uncommitedChanges: true })),
      switchMap(index =>
        this.line$.pipe(take(1)).pipe(
          map(line => ({
            ...line,
            stops: line.stops.map((stop, i) =>
              i === index
                ? {
                    ...stop,
                    realStop: !stop.realStop,
                  }
                : stop
            ),
          })),
          tap(line => super.patchState({ line }))
        )
      )
    )
  );

  readonly addStopToLine$ = super.effect((stop$: Observable<LatLng>) =>
    stop$.pipe(
      tap(() => super.patchState({ uncommitedChanges: true })),
      switchMap(s =>
        this.routeService.queryNearestStreet(s).pipe(
          map<string, Stop>(name => ({ ...s, name, realStop: true })),
          catchError(err => {
            console.error(err);
            const stop: Stop = { ...s, name: '', realStop: true };
            return of(stop);
          })
        )
      ),
      switchMap(stop => this.line$.pipe(take(1)).pipe(map(line => ({ stop, line })))),
      map(({ stop, line }) => ({ ...line, stops: [...line.stops, stop] })),
      tap(line => this.queryPathAndUpdateLine$(line))
    )
  );

  readonly replaceStopOfLine$ = super.effect((replacement$: Observable<{ index: number; stop: Stop }>) =>
    replacement$.pipe(
      tap(() => super.patchState({ uncommitedChanges: true })),
      switchMap(replacement => {
        if (!replacement.stop.name) {
          return this.routeService.queryNearestStreet(replacement.stop).pipe(
            map(name => ({
              index: replacement.index,
              stop: { ...replacement.stop, name },
            })),
            catchError(err => {
              console.error(err);
              return of(replacement);
            })
          );
        }
        return of(replacement);
      }),
      switchMap(replacement =>
        this.line$.pipe(take(1)).pipe(
          map(line => ({
            ...line,
            stops: [...line.stops],
          })),
          map(line => ({ line, replacement }))
        )
      ),
      tap(({ replacement, line }) => {
        line.stops[replacement.index] = replacement.stop;
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  readonly moveStopOfLine$ = super.effect((index$: Observable<{ from: number; to: number }>) =>
    index$.pipe(
      tap(() => super.patchState({ uncommitedChanges: true })),
      switchMap(movement =>
        this.line$.pipe(take(1)).pipe(
          map(line => ({
            ...line,
            stops: [...line.stops],
          })),
          map(line => ({ movement, line }))
        )
      ),
      tap(({ movement, line }) => {
        const taken = line.stops.splice(movement.from, 1);
        line.stops.splice(movement.to, 0, taken[0]);
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  readonly removeStopFromLine$ = super.effect((index$: Observable<number>) =>
    index$.pipe(
      tap(() => super.patchState({ uncommitedChanges: true })),
      switchMap(stop =>
        this.line$.pipe(take(1)).pipe(
          map(line => ({
            stop,
            line: { ...line, stops: [...line.stops] },
          }))
        )
      ),
      tap(({ stop, line }) => {
        line.stops.splice(stop, 1);
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  private readonly queryPathAndUpdateLine$ = super.effect((line$: Observable<Line>) =>
    line$.pipe(
      switchMap(line =>
        this.routeService.queryOsrmRoute(line.stops).pipe(
          map(path => ({ ...line, path })),
          tapResponse(
            line => super.patchState({ line }),
            err => {
              console.error(err);
            }
          )
        )
      )
    )
  );

  readonly commitChanges$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => combineLatest([this.line$.pipe(take(1)), this.originalLineName$.pipe(take(1))])),
      tap(([line, name]) => this.store.dispatch(lineSavedInRouteEditor({ oldName: name, line }))),
      tap(() => super.patchState({ uncommitedChanges: false })),
      tap(([line]) => this.router.navigate(['route-editor', line.name]))
    )
  );

  readonly changeLineName$ = super.effect((name$: Observable<string>) =>
    combineLatest([
      this.store.select(lines).pipe(map(lines => lines.map(line => line.name))),
      this.line$.pipe(map(line => line.name)),
    ]).pipe(
      map(([names, currentName]: [string[], string]) => names.filter(name => name !== currentName)),
      switchMap(forbiddenNames =>
        name$.pipe(
          tap(name => {
            super.patchState(state => ({
              ...state,
              line: { ...state.line, name },
              uncommitedChanges: true,
            }));
            if (forbiddenNames.includes(name)) {
              super.patchState({ lineError: 'The name is already used by another line.' });
            } else {
              super.patchState({ lineError: undefined });
            }
          })
        )
      )
    )
  );

  readonly changeLineColor$ = super.effect((color$: Observable<string>) =>
    color$.pipe(
      switchMap(color =>
        this.line$.pipe(
          take(1),
          map(line => ({ ...line, color })),
          tap(line => super.patchState({ line, uncommitedChanges: true }))
        )
      )
    )
  );

  constructor(
    private readonly store: Store<Workbench>,
    private readonly route: ActivatedRoute,
    private readonly routeService: RouteService,
    private readonly router: Router
  ) {
    super({
      line: { name: '', stops: [], path: { waypoints: [], distanceTable: [] }, color: '#000000' },
      originalLineName: '',
      focusedStop: undefined,
      uncommitedChanges: false,
      lineError: undefined,
    });
  }
}
