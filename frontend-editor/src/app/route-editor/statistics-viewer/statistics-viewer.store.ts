/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { filter, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { RouteEditorStore } from '../route-editor.store';
import {
  DetailResult,
  DetourService,
  NotificationService,
  Station,
} from '../../shared';
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
      switchMap(([cap, line]) =>
        this.detourService.queryDetours(line, cap).pipe(
          filter((result) => !result.emptyResult),
          map((result) => ({
            averageDetour: result.averageDetour,
            biggestDetour: {
              ...result.biggestDetour,
              sourceStop: line.stations[result.biggestDetour!.source],
              targetStop: line.stations[result.biggestDetour!.target],
              color: line.color,
            },
            smallestDetour: {
              ...result.smallestDetour,
              sourceStop: line.stations[result.smallestDetour!.source],
              targetStop: line.stations[result.smallestDetour!.target],
              color: line.color,
            },
            medianDetour: {
              ...result.medianDetour,
              sourceStop: line.stations[result.medianDetour!.source],
              targetStop: line.stations[result.medianDetour!.target],
              color: line.color,
            },
          })),
          tapResponse(
            (result) => {
              super.patchState((state) => ({ ...state, ...result }));
            },
            (err) =>
              this.notificationService.raiseNotification(
                'Could not compute detours: ' + err,
                'error'
              )
          )
        )
      )
    )
  );

  constructor(
    private readonly store: RouteEditorStore,
    private readonly detourService: DetourService,
    private readonly notificationService: NotificationService
  ) {
    super({
      averageDetour: 0,
      smallestDetour: undefined,
      medianDetour: undefined,
      biggestDetour: undefined,
      cap: 0,
    });
  }
}
