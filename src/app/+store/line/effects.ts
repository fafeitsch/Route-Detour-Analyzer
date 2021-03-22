/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { RouteService } from '../../route.service';
import { addRawStopToLine, addStopToLine } from './actions';
import { Stop } from '../types';
import { NotificationService } from '../../notification.service';
import { EMPTY } from 'rxjs';

@Injectable()
export class Effects {
  addProperNameToStop$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addRawStopToLine),
      map<{ stop: Stop }, Stop>((prop) => prop.stop),
      switchMap((s) =>
        this.routeService.queryNearestStreet(s).pipe(
          catchError(() => {
            this.notificationService.raiseNotification(
              'Could not nearest address. Is your OSRM URL configured correctly?'
            );
            return EMPTY;
          }),
          map((stop) => addStopToLine({ stop }))
        )
      )
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly routeService: RouteService,
    private readonly notificationService: NotificationService
  ) {}
}
