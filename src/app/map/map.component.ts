/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapStore } from './map.store';
import { NotificationService } from '../notification.service';
import { FocusService } from '../focus.service';
import { OptionsService } from '../options.service';
import { LineStore } from '../line.store';

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
  private markerLayer: any;
  private pathLayer: any;
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
    this.lineStore.getLine$.pipe(takeUntil(this.destroy$)).subscribe((line) => {
      if (this.markerLayer) {
        this.map.removeLayer(this.markerLayer);
      }
      this.markerLayer = L.layerGroup(
        line.stops
          .filter((icon) => icon.realStop)
          .map((stop, index) =>
            L.marker([stop.lat, stop.lng], {
              icon: this.createIcon(stop.realStop, false),
              draggable: true,
            }).on('dragend', ($event) => {
              this.lineStore.replaceStopOfLine$({
                ...stop,
                lat: $event.target.getLatLng().lat,
                lng: $event.target.getLatLng().lng,
                index,
              });
            })
          )
      ).addTo(this.map);
    });
    combineLatest([this.lineStore.getLine$, this.store.getOrignalPath$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([line, path]) => {
        if (this.pathLayer) {
          this.map.removeLayer(this.pathLayer);
        }
        this.drawPath(path, line.color);
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
        const icon = this.createIcon(stop.realStop, true);
        this.focusMarker = L.marker([stop.lat, stop.lng], {
          icon,
        }).addTo(this.map);
      });
  }

  private createIcon(realStop: boolean, enlarged: boolean) {
    if (!realStop) {
      const size = 15;
      return L.divIcon({
        className: 'themed',
        html: `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="currentColor"/>
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

  private drawPath(path: [number, number][], color: string) {
    let options: L.PolylineOptions = { color };
    this.pathLayer = L.polyline(path, options).addTo(this.map);
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
