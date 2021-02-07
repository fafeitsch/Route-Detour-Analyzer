import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, tap } from 'rxjs/operators';
import { addStopToLine, addRawStopToLine } from '../+actions/actions';
import { Stop } from '../+reducers/reducers';
import { RouteService } from '../route.service';

@Injectable()
export class LineEffects {
  addProperNameToStop$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addRawStopToLine),
      map<{ stop: Stop }, Stop>((prop) => prop.stop),
      switchMap((s) => this.routeService.queryNearestStreet(s).pipe(map((stop) => addStopToLine({ stop }))))
    )
  );

  constructor(private readonly actions$: Actions, private readonly routeService: RouteService) {}
}
