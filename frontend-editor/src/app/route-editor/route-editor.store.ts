/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import {
  catchError,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RouteService } from '../shared/route.service';
import { Line, LinesService, Station } from '../shared';
import { isDefined } from '../shared/utils';

interface State {
  line: Line | undefined;
  lineError: string | undefined;
  uncommitedChanges: boolean;
}

@Injectable()
export class RouteEditorStore extends ComponentStore<State> {
  readonly line$ = super.select((state) => state.line).pipe(isDefined());
  readonly totalDistance$ = this.line$.pipe(
    isDefined(),
    map((line) =>
      line.path.map((wp) => wp.dist).reduce((acc, curr) => acc + curr, 0)
    )
  );
  readonly uncommitedChanges$ = super.select(
    (state) => state.uncommitedChanges
  );
  readonly lineError$ = super.select((state) => state.lineError);

  readonly selectLineFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map((params) => params.get('line') || ''),
      switchMap((lineKey: string) =>
        this.linesService.getLine(lineKey).pipe(
          catchError(() => of(undefined)),
          tap((line) => super.patchState({ line }))
        )
      )
    )
  );

  readonly addStopToLine$ = super.effect((stop$: Observable<Station>) =>
    stop$.pipe(
      map((add) => ({ add })),
      this.modifyLineStops()
    )
  );

  readonly moveStopOfLine$ = super.effect(
    (index$: Observable<{ from: number; to: number }>) =>
      index$.pipe(
        map((mod) => ({ swap: [mod.from, mod.to] as [number, number] })),
        this.modifyLineStops()
      )
  );

  readonly removeStopFromLine$ = super.effect((index$: Observable<number>) =>
    index$.pipe(
      map((index) => ({ remove: index })),
      this.modifyLineStops()
    )
  );

  readonly commitChanges$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() =>
        this.line$.pipe(
          take(1),
          isDefined(),
          map((line) => ({
            ...line,
            stops: line.stations.map((stop) => stop.key),
          }))
        )
      ),
      switchMap((line) =>
        this.linesService.saveLine(line).pipe(
          tapResponse(
            () => super.patchState({ uncommitedChanges: false }),
            () => void 0
          )
        )
      )
    )
  );

  readonly changeLineName$ = super.effect((name$: Observable<string>) =>
    name$.pipe(
      tap((name) =>
        super.patchState((state) => ({
          ...state,
          line: state.line ? { ...state.line, name } : undefined,
          uncommitedChanges: true,
        }))
      )
    )
  );

  readonly changeLineColor$ = super.effect((color$: Observable<string>) =>
    color$.pipe(
      tap((color) =>
        super.patchState((state) => ({
          ...state,
          line: state.line ? { ...state.line, color } : undefined,
          uncommitedChanges: true,
        }))
      )
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly routeService: RouteService,
    private readonly linesService: LinesService
  ) {
    super({
      line: undefined,
      uncommitedChanges: false,
      lineError: undefined,
    });
  }

  private modifyLineStops() {
    return (
      source: Observable<{
        add?: Station;
        remove?: number;
        swap?: [number, number];
      }>
    ) =>
      source.pipe(
        tap(() => super.patchState({ uncommitedChanges: true })),
        withLatestFrom(this.line$.pipe(isDefined())),
        map(([mod, line]) => {
          if (mod.add) {
            return this.addStation(line, mod.add);
          } else if (mod.remove) {
            return this.removeStation(line, mod.remove);
          } else if (mod.swap) {
            return this.swapStations(line, mod.swap[0], mod.swap[1]);
          }
          return undefined;
        }),
        isDefined(),
        switchMap((line) =>
          this.routeService.queryOsrmRoute(line.stations).pipe(
            tapResponse(
              (path) =>
                super.patchState({
                  line: {
                    ...line,
                    path,
                  },
                }),
              () => void 0
            )
          )
        )
      );
  }

  private addStation(line: Line, station: Station) {
    return { ...line, stations: [...line.stations, station] };
  }

  private removeStation(line: Line, remove: number) {
    const stations = [...line.stations];
    stations.splice(remove, 1);
    return { ...line, stations };
  }

  private swapStations(line: Line, from: number, to: number) {
    const stations = [...line.stations];
    const taken = stations.splice(from, 1);
    stations.splice(to, 0, ...taken);
    return { ...line, stations };
  }
}
