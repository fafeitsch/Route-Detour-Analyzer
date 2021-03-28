/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { QueriedPath, RouteService, Stop } from './route.service';
import { switchMap, tap } from 'rxjs/operators';
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
  readonly changeStopLatLng$ = super.updater((state, [index, lat, lng]: [number, number, number]) => {
    const line = [...state.line];
    line[index] = { ...state.line[index], lat, lng };
    return { ...state, line };
  });

  readonly addStopToLine$ = super.effect((stop$: Observable<Stop>) =>
    stop$.pipe(
      switchMap((s) =>
        this.routeService.queryNearestStreet(s).pipe(
          tapResponse(
            (stop) => this.addStop$(stop),
            () => {
              this.notificationService.raiseNotification(
                'Could query not nearest address. Is your OSRM URL configured correctly?'
              );
            }
          )
        )
      )
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
}
