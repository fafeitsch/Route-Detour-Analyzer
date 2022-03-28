/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest, EMPTY, forkJoin, Observable } from 'rxjs';
import {
  DetailResult,
  DetourResult,
  DetourService,
  SubPath,
} from '../../detour.service';
import { Store } from '@ngrx/store';
import {
  OptionsState,
  selectTileServer,
  setTileServerFromOptionsPanel,
} from '../../+store/options';
import { RouteEditorStore } from '../route-editor.store';
import { RouteService } from '../../shared/route.service';
import { Line, NotificationService, Station, Waypoint } from '../../shared';
import { isDefined } from '../../shared/utils';

export interface DetourWithStop extends DetailResult {
  sourceStop: Station;
  targetStop: Station;
  color: string;
}

interface State {
  averageDetour: number;
  medianDetour: DetourWithStop | undefined;
  biggestDetour: DetourWithStop | undefined;
  smallestDetour: DetourWithStop | undefined;
  cap: number;
}

@Injectable()
export class StatisticsViewerStore extends ComponentStore<State> {
  readonly getAverageDetour$ = super.select((state) => state.averageDetour);
  readonly getSmallestDetour$ = super.select((state) => state.smallestDetour);
  readonly getMedianDetour$ = super.select((state) => state.medianDetour);
  readonly getBiggestDetour$ = super.select((state) => state.biggestDetour);
  readonly cap$ = super.select((state) => state.cap);
  readonly tileServer$ = this.optionsStore.select(selectTileServer);
  readonly lineColor$ = this.store.line$.pipe(map((line) => line.color));
  readonly consideredStops$ = combineLatest([
    this.store.line$.pipe(map((line) => line.stations.length)),
    this.cap$,
  ]).pipe(map(([stops, cap]) => Math.max(2, stops - cap)));
  readonly numberOfTours$ = combineLatest([
    this.store.line$.pipe(map((line) => line.stations.length)),
    this.cap$,
  ]).pipe(
    map(([stops, cap]) =>
      Math.min(((stops - 2) * (stops - 1)) / 2, ((cap + 1) * (cap + 2)) / 2)
    )
  );

  readonly setCap$ = super.updater((state, cap: number) => ({ ...state, cap }));

  readonly setAverageDetour = super.effect(() =>
    combineLatest([this.cap$, this.store.line$.pipe(isDefined())]).pipe(
      switchMap(([cap, line]) => {
        const sources = this.queryAllPaths(line.stations, cap);
        if (sources.length === 0) {
          super.patchState({
            smallestDetour: undefined,
            biggestDetour: undefined,
            medianDetour: undefined,
            averageDetour: undefined,
          });
          return EMPTY;
        }
        return forkJoin(sources).pipe(
          map<SubPath[], [SubPath[], Line]>((subpaths) => [subpaths, line])
        );
      }),
      map<[SubPath[], Line], [Line, DetourResult]>(([sub, line]) => [
        line,
        this.detourService.computeDetours(line.path, sub),
      ]),
      tap(([line, detour]) =>
        super.patchState({
          smallestDetour: this.extractStopNames(line, detour.smallestDetour),
          biggestDetour: this.extractStopNames(line, detour.biggestDetour),
          medianDetour: this.extractStopNames(line, detour.medianDetour),
          averageDetour: detour.averageDetour,
        })
      )
    )
  );

  readonly setTileServer$ = super.effect((tileServer$: Observable<string>) =>
    tileServer$.pipe(
      tap((tileServer) =>
        this.optionsStore.dispatch(
          setTileServerFromOptionsPanel({ tileServer })
        )
      )
    )
  );

  constructor(
    private readonly store: RouteEditorStore,
    private readonly detourService: DetourService,
    private readonly routeService: RouteService,
    private readonly notificationService: NotificationService,
    private readonly optionsStore: Store<OptionsState>
  ) {
    super({
      averageDetour: 0,
      smallestDetour: undefined,
      medianDetour: undefined,
      biggestDetour: undefined,
      cap: 0,
    });
  }

  private extractStopNames(
    line: Line,
    result: DetailResult | undefined
  ): DetourWithStop | undefined {
    if (!result) {
      return undefined;
    }
    return {
      ...result,
      sourceStop: line.stations[result.source],
      targetStop: line.stations[result.target],
      color: line.color,
    };
  }

  private queryAllPaths(line: Station[], cap: number): Observable<SubPath>[] {
    return this.detourService.createQueryPairs(line, cap).map((pair) =>
      this.routeService.queryOsrmRoute([pair.source, pair.target]).pipe(
        catchError((err) => {
          this.notificationService.raiseNotification(
            'Could not query paths. ' + err,
            'error'
          );
          return EMPTY;
        }),
        map((path: Waypoint[]) => ({
          path,
          startIndex: pair.source.index,
          endIndex: pair.target.index,
        }))
      )
    );
  }
}
