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
  Layer,
  LeafletMouseEvent,
  map as leafletMap,
  Map,
  polyline,
  PolylineOptions,
  tileLayer,
} from 'leaflet';
import {
  OptionsState,
  selectMapCenter,
  selectTileServer,
} from '../../+store/options';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { LatLng, Line, NotificationService } from '../../shared';

@Directive({
  selector: '[osmMap]',
})
export class MapDirective implements AfterViewInit, OnDestroy {
  @Input() set lines(lines: Line[]) {
    this._lines = lines || [];
    this.drawReadonlyLines();
  }

  private _lines: Line[] = [];

  @Input() set centerAndZoom(param: (LatLng & { zoom?: number }) | undefined) {
    if (!param) {
      return;
    }
    this.map?.setView(param, param.zoom);
  }

  @Output() mapReady = new EventEmitter<Map>();
  @Output() canvasClicked = new EventEmitter<LatLng>();

  private _map: Map | undefined = undefined;
  get map(): Map | undefined {
    return this._map;
  }

  private tileLayer: Layer | undefined;
  private readonlyLayers: Layer[] = [];
  private destroy$ = new Subject();

  constructor(
    private readonly el: ElementRef,
    private readonly optionsStore: Store<OptionsState>,
    private readonly notificationService: NotificationService
  ) {}

  ngAfterViewInit() {
    this._map = leafletMap(this.el.nativeElement, {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
    this.optionsStore
      .select(selectMapCenter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((center) => (this.centerAndZoom = center));
    this.optionsStore
      .select(selectTileServer)
      .pipe(takeUntil(this.destroy$))
      .subscribe((url) => {
        if (this.tileLayer) {
          this.map!.removeLayer(this.tileLayer);
        }
        this.tileLayer = tileLayer(url, {
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
}
