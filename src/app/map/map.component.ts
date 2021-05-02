/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapStore } from './map.store';
import { NotificationService } from '../notification.service';
import { FocusService } from '../focus.service';
import { OptionsService } from '../options.service';
import { Line, LineStore } from '../line.store';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapStore],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements AfterViewInit {
  private destroy$ = new Subject<boolean>();
  private map: any;
  private tileLayer: any;
  private markerLayer: any[] = [];
  private pathLayers: any[] = [];
  private focusMarker: any;

  constructor(
    private readonly lineStore: LineStore,
    private readonly store: MapStore,
    private readonly focusService: FocusService,
    private readonly optionsService: OptionsService,
    private readonly notificationService: NotificationService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.store.getCenter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((c) => this.map.setView(new LatLng(c.lat, c.lng), c.zoom));
    this.optionsService
      .getTileServerUrl()
      .pipe(takeUntil(this.destroy$))
      .subscribe((url) => {
        if (this.tileLayer) {
          this.map.removeLayer(this.tileLayer);
        }
        this.tileLayer = L.tileLayer(url, {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });
        this.tileLayer.addTo(this.map);
        this.tileLayer.on('tileerror', () =>
          this.notificationService.raiseNotification(
            `There was a problem fetching map tiles. Is your tile server URL configured correctly?`
          )
        );
      });
    this.store.getPaths$.pipe(takeUntil(this.destroy$)).subscribe((lines) => {
      this.pathLayers.forEach((layer) => this.map.removeLayer(layer));
      this.pathLayers = [];
      lines.forEach((path) => this.drawPath(path));
      this.markerLayer.forEach((layer) => this.map.removeLayer(layer));
      this.markerLayer = [];
      lines.forEach((line) => this.drawStops(line));
    });
    this.focusService
      .getFocus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stop) => {
        if (this.focusMarker) {
          this.map.removeLayer(this.focusMarker);
        }
        if (!stop) {
          return;
        }
        const icon = this.createIcon(stop.realStop, true, stop.color);
        this.focusMarker = L.marker([stop.lat, stop.lng], {
          icon,
        }).addTo(this.map);
      });
  }

  private createIcon(realStop: boolean, enlarged: boolean, color: string) {
    if (!realStop) {
      const size = 15;
      return L.divIcon({
        className: 'themed',
        html: `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}"/>
            </svg>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    } else {
      const size = enlarged ? 30 : 20;
      return L.icon({
        iconUrl: 'assets/icons/stop.svg',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }
  }

  private drawPath(path: { color: string; waypoints: [number, number][] }) {
    let options: L.PolylineOptions = { color: path.color };
    this.pathLayers.push(L.polyline(path.waypoints, options).addTo(this.map));
  }

  private drawStops(line: Line & { selected: boolean }) {
    this.markerLayer.push(
      L.layerGroup(
        line.stops
          .filter((stop) => stop.realStop)
          .map((stop, index) =>
            L.marker([stop.lat, stop.lng], {
              icon: this.createIcon(line.selected && stop.realStop, false, line.color),
              draggable: line.selected,
            }).on('dragend', ($event) => {
              this.lineStore.replaceStopOfLine$({
                ...stop,
                lat: $event.target.getLatLng().lat,
                lng: $event.target.getLatLng().lng,
                index,
              });
            })
          )
      ).addTo(this.map)
    );
  }

  toggleViewAll() {
    this.lineStore.toggleShowAll$();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
    const store = this.lineStore;
    this.map.on('click', function (e: any) {
      const lat: number = Math.round(e.latlng.lat * 100000) / 100000;
      const lng: number = Math.round(e.latlng.lng * 100000) / 100000;
      const stop = { name: lat + ', ' + lng, lat, lng, realStop: true };
      store.addStopToLine$(stop);
    });
  }
}
