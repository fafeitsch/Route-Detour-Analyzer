/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {Injectable} from '@angular/core';
import {ComponentStore} from '@ngrx/component-store';
import {Store} from '@ngrx/store';
import {Stop} from '../+reducers';
import {Observable} from 'rxjs';
import {RouteService} from '../route.service';
import {catchError, map, switchMap, tap} from 'rxjs/operators';

interface State {
  originalPath: [number, number][];
}

@Injectable()
export class MapStore extends ComponentStore<State>{
  readonly getOrignalPath$ = super.select(state => state.originalPath);

  readonly setOriginalPath$ = super.updater((state, path: [number, number][])=>({...state, originalPath: path}));

  readonly updateOriginalPath$ = super.effect(() => this.globalStore.select('line').pipe(
    switchMap(line => this.routeService.queryOsrmRoute(line)),
    map(arr => arr.map<[number, number]>(latlng =>[latlng.lat, latlng.lng])),
    tap(coords => this.setOriginalPath$(coords))
  ))

  constructor(private readonly globalStore: Store<{line: Stop[]}>, private readonly routeService: RouteService) {
    super({originalPath: []});
  }
}
