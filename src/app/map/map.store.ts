/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {Injectable} from '@angular/core';
import {ComponentStore} from '@ngrx/component-store';
import {Store} from '@ngrx/store';
import {LatLng, Stop} from '../+reducers';
import {RouteService} from '../route.service';
import {filter, map, switchMap, tap} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';

export interface LatLngWithZoom extends LatLng{
  zoom: number
}

interface State {
  originalPath: [number, number][];
  center: LatLngWithZoom
}

@Injectable()
export class MapStore extends ComponentStore<State>{
  readonly getOrignalPath$ = super.select(state => state.originalPath);
  readonly getCenter$ = super.select(state => state.center);

  readonly setOriginalPath$ = super.updater((state, path: [number, number][])=>({...state, originalPath: path}));
  readonly setCenter$ = super.updater((state, center: LatLngWithZoom) => ({...state, center: center}))

  readonly updateOriginalPath$ = super.effect(() => this.globalStore.select('line').pipe(
    switchMap(line => this.routeService.queryOsrmRoute(line)),
    map(arr => arr.map<[number, number]>(latlng =>[latlng.lat, latlng.lng])),
    tap(coords => this.setOriginalPath$(coords))
  ))

  readonly readCenterFromRoute$ = super.effect(() => this.route.queryParamMap.pipe(
    map(params => params.get('map')),
    filter(param => !!param),
    map(param => param!.split("/")),
    filter(param => param.length === 3),
    map(param => param.map(x=>+x)),
    map(param => ({lat: param[1], lng: param[2], zoom: param[0]})),
    tap(center => this.setCenter$(center))
  ))

  constructor(private readonly globalStore: Store<{line: Stop[]}>,
              private readonly routeService: RouteService,
              private readonly route: ActivatedRoute) {
    super({originalPath: [], center: {lat: 49.7932, lng:9.9286, zoom: 14}});
  }
}
