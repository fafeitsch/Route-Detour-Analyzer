/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { divIcon, icon, Layer, layerGroup, Map, marker, polyline } from 'leaflet';
import { LatLng, Line, lines, Workbench } from '../../+store/workbench';
import { RouteEditorStore } from '../route-editor.store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'route-map',
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RouteMapComponent {
  @Input() set selectedLine(line: Line) {
    this.line$.next(line);
    this.drawLine();
  }

  @Input() set focusedStop(stop: number | undefined) {
    this._focusedStop = stop;
    if (this.map) {
      this.drawStops();
    }
  }

  private line$ = new BehaviorSubject<Line | undefined>(undefined);
  showAllLines = false;
  readonlyLines$ = combineLatest([this.store.select(lines), this.line$]).pipe(
    map(([lines, line]) => lines.filter(l => l.name !== line?.name))
  );
  private _focusedStop: number | undefined = undefined;
  private map: Map | undefined = undefined;
  private pathLayer: Layer | undefined;
  private markerLayer: Layer | undefined;

  constructor(private readonly routeStore: RouteEditorStore, private readonly store: Store<Workbench>) {}

  private drawLine() {
    if (!this.line$.value || !this.map) {
      if (this.pathLayer && this.map) {
        this.map?.removeLayer(this.pathLayer);
      }
      return;
    }
    if (this.pathLayer && this.map) {
      this.map?.removeLayer(this.pathLayer);
    }
    this.pathLayer = polyline(
      this.line$.value.path?.waypoints.map(wp => [wp.lat, wp.lng]),
      { color: this.line$.value.color }
    ).addTo(this.map);
    this.drawStops();
  }

  mapReady(map: Map) {
    this.map = map;
    this.drawLine();
  }

  private createIcon(realStop: boolean, enlarged: boolean) {
    if (!realStop) {
      const size = 15;
      return divIcon({
        className: 'themed',
        html: `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${this.line$.value!.color}"/>
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

  private drawStops() {
    if (this.markerLayer) {
      this.map?.removeLayer(this.markerLayer);
    }
    this.markerLayer = layerGroup(
      this.line$.value!.stops.map((stop, index) => {
        let dragging = false;
        return marker([stop.lat, stop.lng], {
          icon: this.createIcon(stop.realStop, this._focusedStop === index),
          draggable: true,
        })
          .on('mouseover', () => this.routeStore.setFocusedStop$(index))
          .on('mouseout', () => {
            if (!dragging) {
              this.routeStore.setFocusedStop$(undefined);
            }
          })
          .on('dragstart', () => {
            dragging = true;
          })
          .on('dragend', $event => {
            dragging = false;
            this.routeStore.replaceStopOfLine$({
              index,
              stop: {
                ...stop,
                lat: $event.target.getLatLng().lat,
                lng: $event.target.getLatLng().lng,
              },
            });
          });
      })
    ).addTo(this.map!);
  }

  addStop(latLng: LatLng) {
    this.routeStore.addStopToLine$(latLng);
  }

  toggleViewAll() {
    this.showAllLines = !this.showAllLines;
  }
}
