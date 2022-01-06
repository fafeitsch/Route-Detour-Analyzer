/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import {
  divIcon,
  icon,
  Layer,
  layerGroup,
  LeafletMouseEvent,
  map as leafletMap,
  Map,
  marker,
  polyline,
  PolylineOptions,
  tileLayer,
} from 'leaflet';
import { OptionsState, selectMapCenter, selectTileServer } from '../../+store/options';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { NotificationService } from '../../notification.service';
import { LatLng, Line, Waypoint } from '../../+store/workbench';

@Directive({
  selector: '[osmMap]',
})
export class MapDirective implements AfterViewInit, OnDestroy {
  @Input() set lines(lines: Line[]) {
    this._lines = lines;
    this.drawReadonlyLines();
  }

  private _lines: Line[] = [];

  @Input() set useStopIcon(useIcon: boolean) {
    this._useStopIcon = useIcon;
    this.drawReadonlyLines();
  }

  private _useStopIcon: boolean = false;

  @Output() mapReady = new EventEmitter<Map>();
  @Output() canvasClicked = new EventEmitter<LatLng>();

  private map: Map | undefined = undefined;
  private tileLayer: Layer | undefined;
  private readonlyLayers: Layer[] = [];
  private destroy$ = new Subject();

  constructor(
    private readonly el: ElementRef,
    private readonly optionsStore: Store<OptionsState>,
    private readonly notificationService: NotificationService
  ) {}

  ngAfterViewInit() {
    this.map = leafletMap(this.el.nativeElement, {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
    this.optionsStore
      .select(selectMapCenter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(center => this.map?.setView(center, center.zoom));
    this.optionsStore
      .select(selectTileServer)
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
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
    this.map!.on('click', (e: LeafletMouseEvent) => {
      const lat: number = Math.round(e.latlng.lat * 100000) / 100000;
      const lng: number = Math.round(e.latlng.lng * 100000) / 100000;
      this.canvasClicked.emit({ lat, lng });
    });
    this.drawReadonlyLines();
    this.mapReady.emit(this.map);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private drawReadonlyLines() {
    if (!this.map) {
      return;
    }
    this.readonlyLayers.forEach(layer => this.map?.removeLayer(layer));
    this._lines.forEach(line => {
      this.drawPath(line.color, line.path.waypoints);
      this.drawStops(line);
    });
  }

  private drawPath(color: string, waypoints: Waypoint[]) {
    let options: PolylineOptions = { color };
    this.readonlyLayers.push(
      polyline(
        waypoints.map(wp => [wp.lat, wp.lng]),
        options
      ).addTo(this.map!)
    );
  }

  private drawStops(line: Line) {
    this.readonlyLayers.push(
      layerGroup(
        line.stops
          .map((stop, index) => ({ ...stop, index }))
          .filter(stop => stop.realStop)
          .map(stop =>
            marker([stop.lat, stop.lng], {
              icon: this.createIcon(stop.realStop, line.color),
            })
          )
      ).addTo(this.map!)
    );
  }

  private createIcon(realStop: boolean, color: string) {
    if (!realStop) {
      return;
    }
    if (!this._useStopIcon) {
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
      const size = 20;
      return icon({
        iconUrl: 'assets/icons/stop.svg',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }
  }
}
