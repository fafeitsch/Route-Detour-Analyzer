/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { StationManagerStore } from '../station-manager.store';
import { Station } from '../../shared';

@Component({
  selector: 'station-list',
  templateUrl: './station-list.component.html',
  styleUrls: ['./station-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column flex-gap-2' },
})
export class StationListComponent {
  @Input() stations: Station[] = [];

  @Input() set focusedStation(station: Station | undefined) {
    if (this._focusedStation?.key === station?.key) {
      return;
    }
    this._focusedStation = station;
    if (!station) {
      return;
    }
    document.querySelector('#station' + station!.key)?.scrollIntoView(true);
  }

  get focusedStation() {
    return this._focusedStation;
  }

  private _focusedStation: Station | undefined = undefined;

  @Output() centerOnStation = new EventEmitter<Station>();
  @Output() focusStation = new EventEmitter<Station | undefined>();

  constructor(private readonly stationManagerStore: StationManagerStore) {}

  stationHovered(station: Station) {
    this._focusedStation = station;
    this.focusStation.emit(station);
  }

  unfocusStation() {
    this.focusStation.emit(undefined);
  }

  deleteStation(index: number) {
    this.stationManagerStore.deleteStation$(index);
  }

  centerStation(station: Station) {
    this.centerOnStation.emit(station);
  }

  renameStation(toChange: number, name: string) {
    this.stationManagerStore.renameStation$({ toChange, name });
  }

  toggleWaypoint(key: string) {
    this.stationManagerStore.toggleStationWaypoint(key);
  }
}
