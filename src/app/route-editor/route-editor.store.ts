/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Domain, lines, lineSavedInRouteEditor, Station, Workbench } from '../+store/workbench';
import { Store } from '@ngrx/store';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { RouteService } from '../route.service';
import Line = Domain.Line;

interface State {
  line: Line;
  originalLineName: string;
  lineError: string | undefined;
  uncommitedChanges: boolean;
}

const defaultLine = {
  name: '',
  stops: [],
  path: { waypoints: [], distTable: [] },
  color: '#000000',
  timetable: [],
};

@Injectable()
export class RouteEditorStore extends ComponentStore<State> {
  readonly line$ = super.select(state => state.line);
  readonly totalDistance$ = this.line$.pipe(
    map(line => line.path?.distTable || []),
    map(table => (table.length === 0 ? 0 : table[0][table.length - 1]))
  );
  readonly uncommitedChanges$ = super.select(state => state.uncommitedChanges);
  readonly lineError$ = super.select(state => state.lineError);
  readonly originalLineName$ = super.select(state => state.originalLineName);

  readonly selectLineFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map(params => params.get('line')),
      switchMap(lineName =>
        this.store.select(lines).pipe(
          map(lines => lines.find(line => line.name === lineName)),
          map(line => (!line ? { ...defaultLine, name: lineName || '' } : { ...line })),
          tap(line => super.patchState({ line, originalLineName: line.name }))
        )
      )
    )
  );

  readonly addStopToLine$ = super.effect((stop$: Observable<Station>) =>
    stop$.pipe(
      tap(() => super.patchState({ uncommitedChanges: true })),
      switchMap(stop => this.line$.pipe(take(1)).pipe(map(line => ({ stop, line })))),
      map(({ stop, line }) => ({ ...line, stops: [...line.stops, stop] })),
      tap(line => this.queryPathAndUpdateLine$(line))
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
      line: { ...defaultLine },
      originalLineName: '',
      uncommitedChanges: false,
      lineError: undefined,
    });
  }
}
