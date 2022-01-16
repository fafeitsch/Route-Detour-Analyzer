/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Layer, Map, polyline } from 'leaflet';
import { Domain, lines, Station, Workbench } from '../../+store/workbench';
import { RouteEditorStore } from '../route-editor.store';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { stations } from '../../+store/workbench/selectors';
import Line = Domain.Line;

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

  @Input() focusedStop: Station | undefined = undefined;
  @Input() centeredStop: Station | undefined = undefined;

  @Output() focusStop = new EventEmitter<Station | undefined>();

  line$ = new BehaviorSubject<Line | undefined>(undefined);
  showAllLines = false;
  showAllStations = true;
  readonlyLines$ = combineLatest([this.store.select(lines), this.line$]).pipe(
    map(([lines, line]) => lines.filter(l => l.name !== line?.name))
  );

  allStations$ = this.store.select(stations);
  private map: Map | undefined = undefined;
  private pathLayer: Layer | undefined;

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
  }

  mapReady(map: Map) {
    this.map = map;
    this.drawLine();
  }

  addStop(station: Station) {
    this.routeStore.addStopToLine$(station);
  }

  toggleViewAll() {
    this.showAllLines = !this.showAllLines;
  }

  toggleViewAllStations() {
    this.showAllStations = !this.showAllStations;
  }

  stationFocused(station: Station | undefined) {
    this.focusStop.emit(station);
  }
}
