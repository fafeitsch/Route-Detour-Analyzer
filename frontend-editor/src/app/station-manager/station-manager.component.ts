/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StationManagerStore } from './station-manager.store';
import { map } from 'rxjs/operators';
import { LatLng } from '../+store/workbench';
import { Station } from '../shared';

@Component({
  selector: 'station-manager',
  templateUrl: './station-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StationManagerStore],
})
export class StationManagerComponent {
  stations$ = this.store.stations$.pipe(
    map((stations) => stations.sort((s1, s2) => s1.name.localeCompare(s2.name)))
  );
  focusedStation: Station | undefined = undefined;
  center: (LatLng & { zoom?: number }) | undefined = undefined;

  constructor(private readonly store: StationManagerStore) {}

  commit() {
    this.store.commit$();
  }

  focusStation(station: Station | undefined) {
    this.focusedStation = station;
  }

  setCenteredStation(station: Station) {
    this.center = { lat: station.lat, lng: station.lng, zoom: 18 };
  }
}
