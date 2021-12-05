/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { icon, Layer, layerGroup, Map, marker, polyline, PolylineOptions } from 'leaflet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { lines, Workbench } from '../../+store/workbench';
import { Store } from '@ngrx/store';
import { Waypoint } from '../../route.service';
import { Line } from '../../line.store';

@Component({
  selector: 'overview-map',
  templateUrl: './overview-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'd-flex flex-grow-1' },
})
export class OverviewMapComponent implements AfterViewInit, OnDestroy {
  private map: Map | undefined = undefined;
  private markerLayer: Layer[] = [];
  private pathLayers: Layer[] = [];
  private destroy$ = new Subject<void>();

  constructor(private readonly store: Store<Workbench>) {}

  ngAfterViewInit() {
    this.store
      .select(lines)
      .pipe(takeUntil(this.destroy$))
      .subscribe(lines => {
        this.pathLayers.forEach(layer => this.map!.removeLayer(layer));
        this.pathLayers = [];
        lines.forEach(line => this.drawPath(line.color, line.path?.waypoints || []));
        this.markerLayer.forEach(layer => this.map!.removeLayer(layer));
        this.markerLayer = [];
        lines.forEach(line => this.drawStops(line));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  mapReady(map: Map) {
    this.map = map;
  }

  private drawPath(color: string, waypoints: Waypoint[]) {
    let options: PolylineOptions = { color };
    this.pathLayers.push(
      polyline(
        waypoints.map(wp => [wp.lat, wp.lng]),
        options
      ).addTo(this.map!)
    );
  }

  private drawStops(line: Line) {
    this.markerLayer.push(
      layerGroup(
        line.stops
          .map((stop, index) => ({ ...stop, index }))
          .filter(stop => stop.realStop)
          .map(stop =>
            marker([stop.lat, stop.lng], {
              icon: this.createIcon(stop.realStop),
            })
          )
      ).addTo(this.map!)
    );
  }

  private createIcon(realStop: boolean) {
    if (!realStop) {
      return;
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
