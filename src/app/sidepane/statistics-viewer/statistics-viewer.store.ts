/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { Store } from '@ngrx/store';
import { getOriginalPath, getSubPaths, Paths, QueriedPath, SubPath } from '../../+store/paths';
import { filter, map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DetailResult, DetourResult, DetourService } from '../../detour.service';
import { Stop } from '../../+store/types';

export interface DetourWithStop extends DetailResult {
  sourceName: string;
  targetName: string;
}

interface State {
  totalDistance: number;
  averageDetour: number;
  medianDetour: DetourWithStop | undefined;
  biggestDetour: DetourWithStop | undefined;
  smallestDetour: DetourWithStop | undefined;
}

@Injectable()
export class StatisticsViewerStore extends ComponentStore<State> {
  readonly getTotalDistance$ = super.select((state) => state.totalDistance);
  readonly getAverageDetour$ = super.select((state) => state.averageDetour);
  readonly getSmallestDetour$ = super.select((state) => state.smallestDetour);
  readonly getMedianDetour$ = super.select((state) => state.medianDetour);
  readonly getBiggestDetour$ = super.select((state) => state.biggestDetour);

  readonly setTotalDistance = super.effect(() =>
    this.store.select(getOriginalPath).pipe(
      filter((path) => !!path?.distanceTable.length),
      map((path) => path!.distanceTable[0][path!.distanceTable.length - 1]),
      tap((totalDistance) => super.patchState({ totalDistance }))
    )
  );

  readonly setAverageDetour = super.effect(() =>
    combineLatest([
      this.store.select(getOriginalPath).pipe(filter((path) => !!path)),
      this.store.select(getSubPaths),
      this.store.select('line'),
    ]).pipe(
      map<[QueriedPath, SubPath[], Stop[]], [Stop[], DetourResult]>(([original, sub, line]) => [
        line,
        this.detourService.computeDetours(original.distanceTable, sub),
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
    private readonly store: Store<{ paths: Paths; line: Stop[] }>,
    private readonly detourService: DetourService
  ) {
    super({
      totalDistance: 0,
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
    return { ...result, sourceName: line[result.source].name, targetName: line[result.target].name };
  }
}
