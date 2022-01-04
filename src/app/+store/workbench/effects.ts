/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { SampleService } from '../../shared/sample.service';
import { Action } from '@ngrx/store';
import { dirtyLinesImported, downloadSample, importSampleLines, linesImported } from './actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest, EMPTY, forkJoin, of } from 'rxjs';
import { RouteService } from '../../route.service';
import { Line } from './reducers';

@Injectable()
export class WorkbenchEffects implements OnInitEffects {
  downloadSample$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadSample),
      switchMap(() =>
        this.sampleService.fetchSample().pipe(
          switchMap(lines => this.fetchMissingPaths(lines)),
          map(([lines]) => importSampleLines({ lines })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  fetchMissingPaths$ = createEffect(() =>
    this.actions$.pipe(
      ofType(dirtyLinesImported),
      switchMap(({ lines, replace }) => this.fetchMissingPaths(lines, replace)),
      map(([lines, replace]) => linesImported({ lines, replace })),
      catchError(() => EMPTY)
    )
  );

  constructor(
    private readonly sampleService: SampleService,
    private readonly actions$: Actions,
    private readonly routeService: RouteService
  ) {}

  ngrxOnInitEffects(): Action {
    return downloadSample();
  }

  private fetchMissingPaths(lines: Line[], replace: boolean = true) {
    if (!lines.length) {
      return of([]);
    }
    const requests = lines.map(line => {
      if (line.path) {
        return of(line);
      }
      return this.routeService.queryOsrmRoute(line.stops).pipe(
        map(path => ({
          ...line,
          path,
        }))
      );
    });
    return combineLatest([forkJoin(requests), of(replace)]);
  }
}
