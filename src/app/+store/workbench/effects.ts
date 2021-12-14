/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { SampleService } from '../../shared/sample.service';
import { Action } from '@ngrx/store';
import { downloadSample, importSampleLines } from './actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, of } from 'rxjs';
import { RouteService } from '../../route.service';

@Injectable()
export class WorkbenchEffects implements OnInitEffects {
  downloadSample$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadSample),
      switchMap(() =>
        this.sampleService.fetchSample().pipe(
          switchMap(lines => {
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
            return forkJoin(requests);
          }),
          map(lines => importSampleLines({ lines })),
          catchError(() => EMPTY)
        )
      )
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
}
