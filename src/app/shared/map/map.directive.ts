/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, Directive, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Layer, map as leafletMap, Map, tileLayer } from 'leaflet';
import { OptionsState, selectMapCenter, selectTileServer } from '../../+store/options';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { NotificationService } from '../../notification.service';

@Directive({
  selector: '[id=osmMap]',
})
export class MapDirective implements AfterViewInit, OnDestroy {
  @Output() mapReady = new EventEmitter<Map>();

  private map: Map | undefined = undefined;
  private tileLayer: Layer | undefined;
  private destroy$ = new Subject();

  constructor(
    private readonly optionsStore: Store<OptionsState>,
    private readonly notificationService: NotificationService
  ) {}

  ngAfterViewInit() {
    this.map = leafletMap('osmMap', {
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
    this.mapReady.emit(this.map);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
