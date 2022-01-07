/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { icon, Layer, Map, Marker, marker } from 'leaflet';
import { Domain, LatLng, lines, Station, Workbench } from '../../+store/workbench';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { StationManagerStore } from '../station-manager.store';
import Line = Domain.Line;

@Component({
  selector: 'station-map',
  templateUrl: './station-map.component.html',
  styleUrls: ['./station-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class StationMapComponent {
  @Input() set stations(stations: Station[]) {
    this._stations = stations;
    this.drawStations();
  }

  private _stations: Station[] = [];

  @Input() set focusedStation(stop: Station | undefined) {
    if (!stop && this._focusedStation && this.map) {
      if (this.markers[this._focusedStation.key]) {
        this.map?.removeLayer(this.markers[this._focusedStation.key]);
      }
      this.markers[this._focusedStation.key] = this.createMarker(false)(this._focusedStation).addTo(this.map);
      this._focusedStation = undefined;
    }
    if (stop && this.map) {
      if (this.markers[stop.key]) {
        this.map?.removeLayer(this.markers[stop.key]);
      }
      this.markers[stop.key] = this.createMarker(true)(stop).addTo(this.map);
      this._focusedStation = stop;
    }
    this._focusedStation = stop;
  }

  @Input() centerAndZoom: (LatLng & { zoom?: number }) | undefined = undefined;

  @Output() focusStation = new EventEmitter<Station | undefined>();

  private line$ = new BehaviorSubject<Line | undefined>(undefined);
  showAllLines = false;
  readonlyLines$ = combineLatest([this.store.select(lines), this.line$]).pipe(
    map(([lines, line]) => lines.filter(l => l.name !== line?.name))
  );
  private _focusedStation: Station | undefined = undefined;
  private map: Map | undefined = undefined;
  private markers: { [station: string]: Layer } = {};

  constructor(private readonly stationManagerStore: StationManagerStore, private readonly store: Store<Workbench>) {}

  mapReady(map: Map) {
    this.map = map;
    this.drawStations();
  }

  private createIcon(enlarged: boolean) {
    const size = enlarged ? 30 : 20;
    return icon({
      iconUrl: 'assets/icons/stop.svg',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  private drawStations() {
    if (!this.map) {
      return;
    }
    Object.values(this.markers).forEach(layer => this.map?.removeLayer(layer));
    this.markers = this._stations.reduce((acc, stop, index) => {
      acc[stop.key] = this.createMarker(false)(stop);
      return acc;
    }, {} as { [name: string]: Marker });
    Object.values(this.markers).forEach(layer => layer.addTo(this.map!));
  }

  createMarker(focused: boolean) {
    return (station: Station) => {
      let dragging = false;
      return marker([station.lat, station.lng], {
        icon: this.createIcon(focused),
        draggable: true,
      })
        .on('mouseover', () => this.focusStation.emit(station))
        .on('mouseout', () => {
          if (!dragging) {
            this.focusStation.emit(undefined);
          }
        })
        .on('dragstart', () => {
          dragging = true;
        })
        .on('dragend', $event => {
          dragging = false;
          this.stationManagerStore.moveStop$({
            key: station.key,
            lat: $event.target.getLatLng().lat,
            lng: $event.target.getLatLng().lng,
          });
        });
    };
  }

  addStop(latLng: LatLng) {
    this.stationManagerStore.addStation$(latLng);
  }

  toggleViewAll() {
    this.showAllLines = !this.showAllLines;
  }
}
