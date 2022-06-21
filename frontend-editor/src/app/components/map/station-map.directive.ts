/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MapDirective } from '@rda/components/map/map.directive';
import { LatLng, NotificationService, Station } from '../../shared';
import { icon, marker, Marker } from 'leaflet';
import { PropertiesService } from '../../shared/properties.service';

@Directive({
  selector: '[stationMap]',
})
export class StationMapDirective extends MapDirective implements AfterViewInit {
  @Input() set stations(stations: Station[]) {
    this._stations = stations || [];
    this.drawStations();
  }
  private _stations: Station[] = [];

  @Input() set disableDragging(dragging: boolean) {
    if (dragging) {
      Object.values(this.markers).forEach((mapMarker) =>
        mapMarker.dragging?.disable()
      );
    } else {
      Object.values(this.markers).forEach((mapMarker) =>
        mapMarker.dragging?.enable()
      );
    }
    this._disabledDragging = dragging;
  }
  private _disabledDragging = false;

  @Input() set focusedStation(stop: Station | undefined) {
    if (!super.map) {
      return;
    }
    const focusedMarkers = this.markers
      .map((m, i) => ({ marker: m, index: i }))
      .filter((m) => m.marker.focused);
    focusedMarkers.forEach((m) => {
      super.map?.removeLayer(m.marker);
      this.markers[m.index] = this.createMarker(false)(
        this._stations[m.index],
        m.index
      ).addTo(super.map!);
    });
    if (stop) {
      const index = this._stations.findIndex((s) => s.key === stop?.key);
      if (this.markers[index]) {
        super.map.removeLayer(this.markers[index]);
      }
      this.markers[index] = this.createMarker(true)(stop, index).addTo(
        super.map
      );
      this.markers[index].focused = true;
    }
  }

  @Output() focusStation = new EventEmitter<Station | undefined>();
  @Output() clickStation = new EventEmitter<Station>();
  @Output() dragStation = new EventEmitter<
    LatLng & { key: string; index: number }
  >();

  private markers: (Marker & { focused?: boolean })[] = [];

  constructor(
    el: ElementRef,
    notificationService: NotificationService,
    propertiesService: PropertiesService
  ) {
    super(el, notificationService, propertiesService);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.drawStations();
  }

  private createStationIcon(enlarged: boolean, isWaypoint: boolean) {
    if (isWaypoint) {
      const waypointSize = enlarged ? 15 : 10;
      return super.createSimpleMarker(waypointSize);
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
    Object.values(this.markers).forEach((layer) =>
      super.map?.removeLayer(layer)
    );
    this.markers = this._stations.map((stop, index) =>
      this.createMarker(false)(stop, index)
    );
    this.markers.forEach((layer) => layer.addTo(super.map!));
  }

  createMarker(focused: boolean) {
    return (station: Station, index: number) => {
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
        .on('dragend', ($event) => {
          dragging = false;
          this.dragStation.emit({
            key: station.key,
            index,
            lat: $event.target.getLatLng().lat as number,
            lng: $event.target.getLatLng().lng as number,
          });
        });
    };
  }
}
