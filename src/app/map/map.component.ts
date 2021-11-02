/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MapStore} from './map.store';
import {NotificationService} from '../notification.service';
import {FocusService} from '../focus.service';
import {OptionsStore} from '../options-store.service';
import {Line, LineStore} from '../line.store';
import {
  divIcon,
  icon,
  LatLng,
  Layer,
  layerGroup,
  map as leafletMap,
  Map,
  marker,
  Marker,
  polyline,
  PolylineOptions,
  tileLayer,
} from 'leaflet';

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
  private map: Map | undefined = undefined;
  private tileLayer: Layer | undefined;
  private markerLayer: Layer[] = [];
  private pathLayers: Layer[] = [];
  private focusMarker: Marker | undefined;

  constructor(
    private readonly lineStore: LineStore,
    private readonly store: MapStore,
    private readonly focusService: FocusService,
    private readonly optionsStore: OptionsStore,
    private readonly notificationService: NotificationService
  ) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.store.getCenter$
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => this.map!.setView(new LatLng(c.lat, c.lng), c.zoom));
    this.optionsStore.tileServerUrl$.pipe(takeUntil(this.destroy$)).subscribe(url => {
      if (this.tileLayer) {
        this.map!.removeLayer(this.tileLayer);
      }
      this.tileLayer = tileLayer(url, {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      });
      this.tileLayer.addTo(this.map!);
      this.tileLayer.on('tileerror', () =>
        this.notificationService.raiseNotification(
          `There was a problem fetching map tiles. Make sure that you called the site with a query param 'tiles=URL', where URL
            points to a tile server.`
        )
      );
    });
    this.store.getPaths$.pipe(takeUntil(this.destroy$)).subscribe(lines => {
      this.pathLayers.forEach(layer => this.map!.removeLayer(layer));
      this.pathLayers = [];
      lines.forEach(line => this.drawPath(line.color, line.path?.waypoints || []));
      this.markerLayer.forEach(layer => this.map!.removeLayer(layer));
      this.markerLayer = [];
      lines.forEach(line => this.drawStops(line));
    });
    this.focusService
      .getFocus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stop => {
        if (this.focusMarker) {
          this.map!.removeLayer(this.focusMarker);
        }
        if (!stop) {
          return;
        }
        const icon = this.createIcon(stop.realStop, true, stop.color);
        this.focusMarker = marker([stop.lat, stop.lng], {
          icon,
        }).addTo(this.map!);
      });
  }

  private createIcon(realStop: boolean, enlarged: boolean, color: string) {
    if (!realStop) {
      const size = 15;
      return divIcon({
        className: 'themed',
        html: `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}"/>
            </svg>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    } else {
      const size = enlarged ? 30 : 20;
      return icon({
        iconUrl: 'assets/icons/stop.svg',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }
  }

  private drawPath(color: string, waypoints: [number, number][]) {
    let options: PolylineOptions = {color};
    this.pathLayers.push(polyline(waypoints, options).addTo(this.map!));
  }

  private drawStops(line: Line & { selected: boolean }) {
    this.markerLayer.push(
      layerGroup(
        line.stops
          .map((stop, index) => ({...stop, index}))
          .filter(stop => stop.realStop)
          .map(stop =>
            marker([stop.lat, stop.lng], {
              icon: this.createIcon(line.selected && stop.realStop, false, line.color),
              draggable: line.selected,
            }).on('dragend', $event => {
              this.lineStore.replaceStopOfLine$({
                index: stop.index,
                stop: {
                  ...stop,
                  lat: $event.target.getLatLng().lat,
                  lng: $event.target.getLatLng().lng,
                }
              });
            })
          )
      ).addTo(this.map!)
    );
  }

  toggleViewAll() {
    this.lineStore.toggleShowAll$();
  }

  private initMap(): void {
    this.map = leafletMap('map', {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
    const store = this.lineStore;
    this.map!.on('click', function (e: any) {
      const lat: number = Math.round(e.latlng.lat * 100000) / 100000;
      const lng: number = Math.round(e.latlng.lng * 100000) / 100000;
      const stop = {name: lat + ', ' + lng, lat, lng, realStop: true};
      store.addStopToLine$(stop);
    });
  }
}
