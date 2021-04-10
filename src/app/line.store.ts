/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable, of } from 'rxjs';
import { QueriedPath, RouteService, Stop } from './route.service';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { Injectable } from '@angular/core';

interface State {
  line: Stop[];
  path: QueriedPath;
  minSubPathCount: 0;
}

@Injectable()
export class LineStore extends ComponentStore<State> {
  readonly getLine$ = super.select((state) => state.line);
  readonly getPath$ = super.select((state) => state.path);
  readonly getTotalDistance$ = super
    .select((state) => state.path)
    .pipe(
      map((path) => path.distanceTable),
      filter((table) => table.length > 0),
      map((table) => table[0][table.length - 1])
    );

  private readonly addStop$ = super.updater((state, stop: Stop) => ({
    ...state,
    line: [...state.line, stop],
  }));
  readonly removeStop$ = super.updater((state, index: number) => {
    const line = [...state.line];
    line.splice(index, 1);
    return { ...state, line };
  });
  readonly moveStop$ = super.updater((state, [from, to]: [number, number]) => {
    const line = [...state.line];
    const taken = line.splice(from, 1);
    line.splice(to, 0, taken[0]);
    return { ...state, line };
  });
  readonly renameStop$ = super.updater((state, [index, name]: [number, string]) => {
    const line = [...state.line];
    line[index] = { ...state.line[index], name };
    return { ...state, line };
  });
  readonly toggleRealStop$ = super.updater((state, index: number) => {
    const line = [...state.line];
    line[index] = { ...state.line[index], realStop: !state.line[index].realStop };
    return { ...state, line };
  });
  readonly replaceStop$ = super.updater((state, [replacement, index]: [Stop, number]) => {
    const line = [...state.line];
    line[index] = { ...replacement };
    return { ...state, line };
  });

  readonly addStopToLine$ = super.effect((stop$: Observable<Stop>) =>
    stop$.pipe(switchMap((s) => this.queryNearestStop(s, this.addStop$.bind(this))))
  );

  readonly replaceStopOfLine$ = super.effect((replacement$: Observable<Stop & { index: number }>) =>
    replacement$.pipe(
      switchMap((replacement) => {
        if (!replacement.name) {
          return this.queryNearestStop(replacement, (stop) => this.replaceStop$([stop, replacement.index]));
        }
        return of(replacement).pipe(tap((stop) => this.replaceStop$([stop, stop.index])));
      })
    )
  );

  readonly queryPath$ = super.effect(() =>
    this.getLine$.pipe(
      switchMap((line) => this.routeService.queryOsrmRoute(line)),
      tap((x) => console.log(x)),
      tap((path) => super.patchState({ path }))
    )
  );

  constructor(private readonly routeService: RouteService, private readonly notificationService: NotificationService) {
    super({ line: [], minSubPathCount: 0, path: { distanceTable: [], waypoints: [] } });
  }

  private queryNearestStop(stop: Stop, consumer: (stop: Stop) => void) {
    return this.routeService.queryNearestStreet(stop).pipe(
      tapResponse(consumer, () => {
        this.notificationService.raiseNotification(
          'Could query not nearest address. Is your OSRM URL configured correctly?'
        );
      })
    );
  }
}
