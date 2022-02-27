/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { RouteService } from '../shared/route.service';
import { LatLng, Station, StationsService } from '../shared/';

interface State {
  stations: (Station & { dirty?: boolean })[];
  deleted: string[];
}

@Injectable()
export class StationManagerStore extends ComponentStore<State> {
  stations$ = super.select((state) => state.stations);
  deleted$ = super.select((state) => state.deleted);

  readonly deleteStation$ = super.updater((state, index: number) => {
    const station = state.stations[index];
    const result = { ...state, stations: [...state.stations] };
    result.stations.splice(index, 1);
    if (station.key) {
      result.deleted = [...state.deleted, station.key];
    }
    return result;
  });

  readonly moveStop$ = super.updater(
    (
      state,
      { toChange, lat, lng }: { toChange: number; lat: number; lng: number }
    ) => ({
      ...state,
      stations: state.stations.map((station, index) =>
        index !== toChange
          ? station
          : {
              ...station,
              lat,
              lng,
              dirty: true,
            }
      ),
    })
  );

  readonly renameStation$ = super.updater(
    (state, { toChange, name }: { toChange: number; name: string }) => ({
      ...state,
      stations: state.stations.map((station, index) =>
        index !== toChange ? station : { ...station, name, dirty: true }
      ),
    })
  );

  readonly toggleStationWaypoint = super.updater((state, key: string) => ({
    ...state,
    stations: state.stations.map((station) =>
      station.key !== key
        ? station
        : { ...station, isWaypoint: !station.isWaypoint, dirty: true }
    ),
  }));

  loadStations = super.effect(() =>
    this.stationsService
      .queryStations(true)
      .pipe(tap((stations) => super.patchState({ stations })))
  );

  readonly commit$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() =>
        combineLatest([
          this.stations$.pipe(take(1)),
          this.deleted$.pipe(take(1)),
        ])
      ),
      tap((x) => console.log(x)),
      switchMap(([stations, deleted]) =>
        this.stationsService.updateStations({
          changedOrAdded: stations.filter((station) => station.dirty),
          deleted,
        })
      )
    )
  );

  readonly addStation$ = super.effect((trigger$: Observable<LatLng>) =>
    trigger$.pipe(
      switchMap((latLng) =>
        this.routeService.queryNearestStreet(latLng).pipe(
          catchError((err) => {
            console.error(err);
            return of('');
          }),
          map((name) => ({
            ...latLng,
            name,
            key: '',
            lines: [],
            isWaypoint: false,
            dirty: true,
          })),
          tap((station) =>
            super.patchState((state) => ({
              stations: [...state.stations, station],
            }))
          )
        )
      )
    )
  );

  constructor(
    private readonly routeService: RouteService,
    private readonly stationsService: StationsService
  ) {
    super({
      stations: [],
      deleted: [],
    });
  }
}
