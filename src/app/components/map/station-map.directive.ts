import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { MapDirective } from '@rda/components/map/map.directive';
import { Store } from '@ngrx/store';
import { OptionsState } from '../../+store/options';
import { NotificationService } from '../../notification.service';
import { LatLng, Station } from '../../+store/workbench';
import { divIcon, icon, marker, Marker } from 'leaflet';

@Directive({
  selector: '[stationMap]',
})
export class StationMapDirective extends MapDirective implements AfterViewInit {
  @Input() set stations(stations: Station[]) {
    this._stations = stations;
    this.drawStations();
  }
  private _stations: Station[] = [];

  @Input() set disableDragging(dragging: boolean) {
    if (dragging) {
      Object.values(this.markers).forEach(marker => marker.dragging?.disable());
    } else {
      Object.values(this.markers).forEach(marker => marker.dragging?.enable());
    }
    this._disabledDragging = dragging;
  }
  private _disabledDragging = false;

  @Input() set focusedStation(stop: Station | undefined) {
    if (!stop && this._focusedStation && super.map) {
      if (this.markers[this._focusedStation.key]) {
        super.map?.removeLayer(this.markers[this._focusedStation.key]);
      }
      this.markers[this._focusedStation.key] = this.createMarker(false)(this._focusedStation).addTo(super.map);
      this._focusedStation = undefined;
    }
    if (stop && super.map) {
      if (this.markers[stop.key]) {
        super.map?.removeLayer(this.markers[stop.key]);
      }
      this.markers[stop.key] = this.createMarker(true)(stop).addTo(super.map);
      this._focusedStation = stop;
    }
    this._focusedStation = stop;
  }

  private _focusedStation: Station | undefined = undefined;

  @Output() focusStation = new EventEmitter<Station | undefined>();
  @Output() clickStation = new EventEmitter<Station>();
  @Output() dragStation = new EventEmitter<LatLng & { key: string }>();

  private markers: { [station: string]: Marker } = {};

  constructor(el: ElementRef, optionsStore: Store<OptionsState>, notificationService: NotificationService) {
    super(el, optionsStore, notificationService);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.drawStations();
  }

  private createStationIcon(enlarged: boolean, isWaypoint: boolean) {
    if (isWaypoint) {
      const size = enlarged ? 15 : 10;
      return divIcon({
        className: 'themed',
        html: `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#000000"/>
            </svg>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }
    const size = enlarged ? 30 : 20;
    return icon({
      iconUrl: 'assets/icons/stop.svg',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  private drawStations() {
    if (!super.map) {
      return;
    }
    Object.values(this.markers).forEach(layer => super.map?.removeLayer(layer));
    this.markers = this._stations.reduce((acc, stop, index) => {
      acc[stop.key] = this.createMarker(false)(stop);
      return acc;
    }, {} as { [name: string]: Marker });
    Object.values(this.markers).forEach(layer => layer.addTo(super.map!));
  }

  createMarker(focused: boolean) {
    return (station: Station) => {
      let dragging = false;
      return marker([station.lat, station.lng], {
        icon: this.createStationIcon(focused, station.isWaypoint || false),
        draggable: !this._disabledDragging,
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
        .on('click', () => {
          this.clickStation.emit(station);
        })
        .on('dragend', $event => {
          dragging = false;
          this.dragStation.emit({
            key: station.key,
            lat: $event.target.getLatLng().lat as number,
            lng: $event.target.getLatLng().lng as number,
          });
        });
    };
  }
}
