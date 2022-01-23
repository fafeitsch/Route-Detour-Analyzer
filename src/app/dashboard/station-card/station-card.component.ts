/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Workbench } from '../../+store/workbench';
import { Store } from '@ngrx/store';
import { stations } from '../../+store/workbench/selectors';
import { map } from 'rxjs/operators';

@Component({
  selector: 'station-card',
  templateUrl: './station-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationCardComponent {
  stationCount$ = this.store.select(stations).pipe(
    map(stations =>
      stations.reduce(
        (acc, curr) => {
          if (curr.isWaypoint) {
            acc.waypoints = acc.waypoints + 1;
          } else {
            acc.stations = acc.stations + 1;
          }
          return acc;
        },
        { stations: 0, waypoints: 0 }
      )
    )
  );

  constructor(private readonly store: Store<Workbench>) {}
}
