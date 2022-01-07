/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { SampleService } from '../../shared/sample.service';
import { Action } from '@ngrx/store';
import { downloadSample, importSampleLines, persistStationManagerChange, stationManagerChange } from './actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';
import { RouteService } from '../../route.service';
import { DataModel, Station } from './reducers';

@Injectable()
export class WorkbenchEffects implements OnInitEffects {
  downloadSample$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadSample),
      switchMap(() =>
        this.sampleService.fetchSample().pipe(
          map(workbench => importSampleLines({ workbench })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  updateChangedLines$ = createEffect(() =>
    this.actions$.pipe(
      ofType(stationManagerChange),
      switchMap(({ dirtyLines, lines, stations }) => {
        const stationMap = stations.reduce((acc, curr) => {
          acc[curr.key] = curr;
          return acc;
        }, {} as { [key: string]: Station });
        const requests: Observable<DataModel.Line>[] = lines.map(line => {
          if (dirtyLines[line.name]) {
            const stops = line.stops.map(stop => {
              if (DataModel.isStationReference(stop)) {
                return { ...stationMap[stop.key], realStop: true };
              }
              return { ...stop, realStop: false };
            });
            return this.routeService.queryOsrmRoute(stops).pipe(map(path => ({ ...line, path })));
          } else {
            return of(line);
          }
        });
        return forkJoin(requests).pipe(
          map(updatedLines =>
            persistStationManagerChange({
              lines: updatedLines,
              stations,
            })
          )
        );
      })
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
