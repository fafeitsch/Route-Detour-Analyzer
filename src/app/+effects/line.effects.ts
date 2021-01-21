import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map, switchMap, tap} from 'rxjs/operators';
import {addStopToLine, addUnamedStopToLine} from '../+actions/actions';
import {Stop} from '../+reducers';
import {Observable} from 'rxjs';
import {RouteService} from '../route.service';

@Injectable()
export class LineEffects {
  addProperNameToStop$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addUnamedStopToLine),
      map<{ stop: Stop }, Stop>(prop => prop.stop),
      switchMap((stop) =>
        this.routeService.queryOsrmName(stop).pipe(
          map(name => ({...stop, name})),
          map(stop => addStopToLine({stop}))
        ),
      ),
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly routeService: RouteService,
  ) {
  }
}
