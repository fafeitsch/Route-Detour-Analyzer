/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { catchError, filter, map, pluck, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest, EMPTY, forkJoin, Observable } from 'rxjs';
import { DetailResult, DetourResult, DetourService, SubPath } from '../detour.service';
import { LineStore } from '../line.store';
import { QueriedPath, RouteService, Stop } from '../route.service';
import { NotificationService } from '../notification.service';
import { OptionsStore } from '../options-store.service';

export interface DetourWithStop extends DetailResult {
  sourceName: string;
  targetName: string;
}

interface State {
  averageDetour: number;
  medianDetour: DetourWithStop | undefined;
  biggestDetour: DetourWithStop | undefined;
  smallestDetour: DetourWithStop | undefined;
}

@Injectable()
export class StatisticsViewerStore extends ComponentStore<State> {
  readonly getAverageDetour$ = super.select(state => state.averageDetour);
  readonly getSmallestDetour$ = super.select(state => state.smallestDetour);
  readonly getMedianDetour$ = super.select(state => state.medianDetour);
  readonly getBiggestDetour$ = super.select(state => state.biggestDetour);
  readonly lineColor$ = this.store.getLine$.pipe(pluck('color'));

  readonly setAverageDetour = super.effect(() =>
    combineLatest([this.store.getSelectedPath$, this.optionsStore.cap$, this.store.getLine$.pipe(pluck('stops'))]).pipe(
      filter(([path, _, line]) => path.distanceTable.length === line.length),
      switchMap(([path, cap, line]) => {
        const sources = this.queryAllPaths(line, cap);
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
          map<SubPath[], [QueriedPath, SubPath[], Stop[]]>(subpaths => [path, subpaths, line])
        );
      }),
      map<[QueriedPath, SubPath[], Stop[]], [Stop[], DetourResult]>(([path, sub, line]) => [
        line,
        this.detourService.computeDetours(path.distanceTable, sub),
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

  constructor(
    private readonly store: LineStore,
    private readonly detourService: DetourService,
    private readonly routeService: RouteService,
    private readonly notificationService: NotificationService,
    private readonly optionsStore: OptionsStore
  ) {
    super({
      averageDetour: 0,
      smallestDetour: undefined,
      medianDetour: undefined,
      biggestDetour: undefined,
    });
  }

  private extractStopNames(line: Stop[], result: DetailResult | undefined): DetourWithStop | undefined {
    if (!result) {
      return undefined;
    }
    return {
      ...result,
      sourceName: line[result.source].name,
      targetName: line[result.target].name,
    };
  }

  private queryAllPaths(line: Stop[], cap: number): Observable<SubPath>[] {
    return this.detourService.createQueryPairs(line, cap).map(pair =>
      this.routeService.queryOsrmRoute([pair.source, pair.target]).pipe(
        catchError(() => {
          this.notificationService.raiseNotification(
            "Could not query paths. Make sure that you called the site with a query param 'osrm=URL', where URL points to an OSRM server."
          );
          return EMPTY;
        }),
        map((path: QueriedPath) => ({
          path,
          startIndex: pair.source.index,
          endIndex: pair.target.index,
        }))
      )
    );
  }
}
