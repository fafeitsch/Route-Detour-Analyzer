import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { ActivatedRoute } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';

interface State {
  cap: number;
  osrmUrl: string;
  tileServerUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class OptionsStore extends ComponentStore<State> {
  readonly cap$ = super.select(state => state.cap);
  readonly osrmUrl$ = super.select(state => state.osrmUrl);
  readonly tileServerUrl$ = super.select(state => state.tileServerUrl);

  readonly setCap$ = super.updater((state, cap: number) => ({ ...state, cap }));
  readonly setOsrmUrl$ = super.updater((state, osrmUrl: string) => ({ ...state, osrmUrl }));
  readonly setTileUrl$ = super.updater((state, tileServerUrl: string) => ({ ...state, tileServerUrl }));

  private readonly loadOsrmFromRoute$ = super.effect(() =>
    this.route.queryParamMap.pipe(
      map(params => params.get('osrm')),
      filter(osrm => !!osrm),
      tap(osrm => this.setOsrmUrl$(osrm!))
    )
  );

  private readonly loadTileServerFromRoute$ = super.effect(() =>
    this.route.queryParamMap.pipe(
      map(params => params.get('tiles')),
      filter(tileUrl => !!tileUrl),
      map(tiles => tiles!.replace(/\$/g, '')),
      tap(tiles => this.setTileUrl$(tiles!))
    )
  );

  private readonly loadTileCapFromRoute$ = super.effect(() =>
    this.route.queryParamMap.pipe(
      map(params => params.get('cap')),
      map(cap => Number(cap)),
      filter(cap => !isNaN(cap)),
      tap(cap => this.setCap$(cap!))
    )
  );

  constructor(private readonly route: ActivatedRoute) {
    super({ cap: 0, osrmUrl: '', tileServerUrl: '' });
  }
}
