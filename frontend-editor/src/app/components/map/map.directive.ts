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
  OnDestroy,
  Output,
} from '@angular/core';
import {
  divIcon,
  Layer,
  LeafletMouseEvent,
  map as leafletMap,
  Map,
  marker,
  Marker,
  polyline,
  PolylineOptions,
  tileLayer,
} from 'leaflet';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Center, LatLng, Line, NotificationService } from '../../shared';
import { PropertiesService } from '../../shared/properties.service';
import { environment } from '../../../environments/environment';

@Directive({
  selector: '[osmMap]',
})
export class MapDirective implements AfterViewInit, OnDestroy {
  @Input() set lines(lines: Line[]) {
    this._lines = lines || [];
    this.drawReadonlyLines();
  }

  private _lines: Line[] = [];

  @Input() set centerAndZoom(param: Center | undefined) {
    if (!param) {
      return;
    }
    this.map?.setView(param, param.zoom);
  }

  @Input() set marker(latLng: LatLng | undefined) {
    this.markerLocation = latLng;
    this.drawMarker();
  }

  @Output() mapReady = new EventEmitter<Map>();
  @Output() canvasClicked = new EventEmitter<LatLng>();

  private _map: Map | undefined = undefined;
  get map(): Map | undefined {
    return this._map;
  }

  private markerLocation: LatLng | undefined = undefined;
  private _marker: Marker | undefined;
  private tileLayer: Layer | undefined;
  private readonlyLayers: Layer[] = [];
  private destroy$ = new Subject();

  constructor(
    private readonly el: ElementRef,
    private readonly notificationService: NotificationService,
    private readonly propertiesService: PropertiesService
  ) {}

  ngAfterViewInit() {
    this._map = leafletMap(this.el.nativeElement, {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
    this.propertiesService
      .getCenter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((center) => {
        this.centerAndZoom = {
          ...(this.markerLocation || center),
          zoom: center.zoom,
        };
      });
    this.tileLayer = tileLayer(environment.backend + '/tile/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    this.tileLayer.addTo(this.map!);
    this.tileLayer.on('tileerror', () =>
      this.notificationService.raiseNotification(
        'There was a problem fetching map tiles. Make sure that your OSM URL points to a reachable tile server.',
        'error'
      )
    );
    this.map!.on('click', (e: LeafletMouseEvent) => {
      const lat: number = Math.round(e.latlng.lat * 100000) / 100000;
      const lng: number = Math.round(e.latlng.lng * 100000) / 100000;
      this.canvasClicked.emit({ lat, lng });
    });
    this.drawReadonlyLines();
    this.drawMarker();
    this.mapReady.emit(this.map);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private drawReadonlyLines() {
    if (!this.map) {
      return;
    }
    this.readonlyLayers.forEach((layer) => this.map?.removeLayer(layer));
    this._lines.forEach((line) => {
      this.drawPath(line.color, line.path);
    });
  }

  private drawPath(color: string, waypoints: { lat: number; lng: number }[]) {
    let options: PolylineOptions = { color };
    this.readonlyLayers.push(
      polyline(
        waypoints.map((wp) => [wp.lat, wp.lng]),
        options
      ).addTo(this.map!)
    );
  }

  private drawMarker() {
    if (this._marker) {
      this.map?.removeLayer(this._marker);
    }
    if (this.markerLocation && this.map) {
      this._marker = marker(
        [this.markerLocation.lat, this.markerLocation.lng],
        { icon: this.createSimpleMarker(20) }
      ).addTo(this.map);
      this.map.setView(this.markerLocation);
    }
  }

  protected createSimpleMarker(size: number) {
    return divIcon({
      className: 'themed',
      html: `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${
        size / 2
      }" fill="#000000"/>
            </svg>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }
}
