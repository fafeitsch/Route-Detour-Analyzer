/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { DataModel, LatLng, Station, stationManagerChange, Workbench } from '../+store/workbench';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { rawLines, stations } from '../+store/workbench/selectors';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { RouteService } from '../route.service';
import Line = DataModel.Line;
import isStationReference = DataModel.isStationReference;

interface State {
  stations: Station[];
  lines: Line[];
  dirtyLines: { [name: string]: boolean };
}

@Injectable()
export class StationManagerStore extends ComponentStore<State> {
  stations$ = super.select(state => state.stations);
  lines$ = super.select(state => state.lines);
  dirtyLines$ = super.select(state => state.dirtyLines);
  stationUsage$ = this.lines$.pipe(
    map(lines => {
      const result: { [key: string]: Line[] | undefined } = {};
      lines.forEach(line =>
        line.stops.forEach(stop => {
          if (!isStationReference(stop)) {
            return;
          }
          result[stop.key] = result[stop.key] || [];
          const lastLine = result[stop.key]![result[stop.key]!.length - 1];
          if (isStationReference(stop) && lastLine !== line) {
            result[stop.key]!.push(line);
          }
        })
      );
      return result;
    })
  );

  readonly deleteStation$ = super.updater((state, { key, replacement }: { key: string; replacement?: string }) => {
    const stations = state.stations.filter(station => station.key !== key);
    const lines: Line[] = state.lines.map(line => {
      if (!replacement) {
        line.stops = line.stops.filter(stop => !isStationReference(stop) || stop.key !== key);
      } else {
        line.stops = line.stops.map(stop =>
          !isStationReference(stop) || stop.key !== key ? stop : { key: replacement! }
        );
      }
      return { ...line };
    });
    return {
      ...state,
      stations,
      lines,
      dirtyLines: { ...state.dirtyLines, ...this.findAffectedLines(key, state.lines) },
    };
  });

  readonly moveStop$ = super.updater((state, { key, lat, lng }: { key: string; lat: number; lng: number }) => ({
    ...state,
    stations: state.stations.map(station =>
      station.key !== key
        ? station
        : {
            ...station,
            lat,
            lng,
          }
    ),
    dirtyLines: { ...state.dirtyLines, ...this.findAffectedLines(key, state.lines) },
  }));

  readonly renameStation$ = super.updater((state, { key, name }: { key: string; name: string }) => ({
    ...state,
    stations: state.stations.map(station => (station.key !== key ? station : { ...station, name })),
  }));

  loadStations = super.effect(() =>
    this.store.select(stations).pipe(
      map(stations => stations.map(station => ({ ...station }))),
      tap(stations => super.patchState({ stations }))
    )
  );

  loadLines = super.effect(() =>
    this.store.select(rawLines).pipe(
      map(lines => lines.map(line => ({ ...line, stops: [...line.stops] }))),
      tap(lines => super.patchState({ lines }))
    )
  );

  readonly commit$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() =>
        combineLatest([this.stations$, this.lines$, this.dirtyLines$]).pipe(
          take(1),
          tap(([stations, lines, dirtyLines]) =>
            this.store.dispatch(stationManagerChange({ stations, dirtyLines, lines }))
          )
        )
      )
    )
  );

  readonly addStation$ = super.effect((trigger$: Observable<LatLng>) =>
    trigger$.pipe(
      switchMap(latLng =>
        this.routeService.queryNearestStreet(latLng).pipe(
          catchError(err => {
            console.error(err);
            return of('');
          }),
          map(name => ({ ...latLng, name })),
          tap(station =>
            super.patchState(state => ({
              stations: [...state.stations, { ...station, key: this.findFreeStationKey(state.stations, station.name) }],
            }))
          )
        )
      )
    )
  );

  constructor(private readonly store: Store<Workbench>, private readonly routeService: RouteService) {
    super({ stations: [], lines: [], dirtyLines: {} });
  }

  private findAffectedLines(station: string, lines: Line[]) {
    return lines.reduce((acc, curr) => {
      if (curr.stops.some(stop => isStationReference(stop) && stop.key === station)) {
        acc[curr.name] = true;
      }
      return acc;
    }, {} as { [name: string]: boolean });
  }

  private findFreeStationKey(stations: Station[], name?: string) {
    const names = new Set(stations.map(station => station.key));
    const keyBase = name ? name.replace(/\s+/, '-').toLocaleLowerCase() : 'station';
    let key = keyBase;
    let increment = 0;
    while (names.has(key) || (keyBase === 'station' && increment === 0)) {
      increment = increment + 1;
      key = `${keyBase}${increment}`;
    }
    return key;
  }
}
