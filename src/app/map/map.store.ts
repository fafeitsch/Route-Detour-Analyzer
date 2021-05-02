/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { filter, map, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LineStore } from '../line.store';
import { LatLng } from '../route.service';

export interface LatLngWithZoom extends LatLng {
  zoom: number;
}

interface State {
  center: LatLngWithZoom;
}

@Injectable()
export class MapStore extends ComponentStore<State> {
  readonly getPaths$ = this.lineStore.getVisibleLines$;
  readonly getCenter$ = super.select((state) => state.center);

  readonly setCenter$ = super.updater((state, center: LatLngWithZoom) => ({
    ...state,
    center: center,
  }));

  readonly readCenterFromRoute$ = super.effect(() =>
    this.route.queryParamMap.pipe(
      map((params) => params.get('map')),
      filter((param) => !!param),
      map((param) => param!.split('/')),
      filter((param) => param.length === 3),
      map((param) => param.map((x) => +x)),
      map((param) => ({ lat: param[1], lng: param[2], zoom: param[0] })),
      tap((center) => this.setCenter$(center))
    )
  );

  constructor(private readonly lineStore: LineStore, private readonly route: ActivatedRoute) {
    super({
      center: { lat: 49.7932, lng: 9.9286, zoom: 14 },
    });
  }
}
