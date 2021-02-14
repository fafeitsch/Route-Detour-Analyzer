/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { map, mergeAll, pluck, startWith, switchMap } from 'rxjs/operators';
import { Stop } from '../types';
import { RouteService } from '../../route.service';
import { addSubPath, resetSubPaths, setPaths } from './actions';
import { Store } from '@ngrx/store';
import { combineLatest, merge } from 'rxjs';
import { Options } from '../options';
import { DetourService } from '../../detour.service';

@Injectable()
export class Effects {
  queryPaths$ = createEffect(() =>
    combineLatest([this.store.select('line'), this.store.select('options').pipe(pluck('evaluationRangeCap'))]).pipe(
      switchMap(([line, cap]) =>
        merge([this.queryOriginalPath(line), ...this.queryAllPaths(line, cap)]).pipe(
          mergeAll(),
          startWith(resetSubPaths())
        )
      )
    )
  );

  private queryOriginalPath(line: Stop[]) {
    return this.routeService.queryOsrmRoute(line).pipe(map((originalPath) => setPaths({ originalPath })));
  }

  private queryAllPaths(line: Stop[], cap: number) {
    return this.detourService.createQueryPairs(line, cap).map((pair) =>
      this.routeService.queryOsrmRoute([pair.source, pair.target]).pipe(
        map((path) => ({ path, startIndex: pair.source.index, endIndex: pair.target.index })),
        map((path) => addSubPath({ path }))
      )
    );
  }

  constructor(
    private readonly routeService: RouteService,
    private readonly store: Store<{ line: Stop[]; options: Options }>,
    private readonly detourService: DetourService
  ) {}
}
