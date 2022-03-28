/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Layer, Map, polyline } from 'leaflet';
import { RouteEditorStore } from '../route-editor.store';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import {
  Line,
  LinesService,
  NotificationService,
  Station,
  StationsService,
} from '../../shared';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'route-map',
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class RouteMapComponent {
  @Input() set selectedLine(line: Line) {
    this.line = line;
    if (!line) {
      return;
    }
    this.drawLine();
  }

  @Input() focusedStop: Station | undefined = undefined;
  @Input() centeredStop: Station | undefined = undefined;

  @Output() focusStop = new EventEmitter<Station | undefined>();

  line: Line | undefined = undefined;
  showAllStations = true;
  readonlyLines$ = new BehaviorSubject<Line[]>([]);

  allStations$ = this.stationsService.queryStations(false).pipe(
    catchError((err) => {
      this.notificationService.raiseNotification(
        'Could not load stations: ' + err,
        'error'
      );
      return of([]);
    })
  );
  private map: Map | undefined = undefined;
  private pathLayer: Layer | undefined;

  constructor(
    private readonly routeStore: RouteEditorStore,
    private readonly linesService: LinesService,
    private readonly stationsService: StationsService,
    private readonly notificationService: NotificationService
  ) {}

  private drawLine() {
    if (!this.line || !this.map) {
      if (this.pathLayer && this.map) {
        this.map?.removeLayer(this.pathLayer);
      }
      return;
    }
    if (this.pathLayer && this.map) {
      this.map?.removeLayer(this.pathLayer);
    }
    this.pathLayer = polyline(
      this.line?.path.map((wp) => [wp.lat, wp.lng]) || [],
      { color: this.line?.color || '#000000' }
    ).addTo(this.map);
  }

  mapReady(leafletMap: Map) {
    this.map = leafletMap;
    this.drawLine();
  }

  addStop(station: Station) {
    this.routeStore.addStopToLine$(station);
  }

  toggleViewAll(value: MatSlideToggleChange) {
    if (!value.checked) {
      this.readonlyLines$.next([]);
      return;
    }
    this.linesService
      .getLinePaths()
      .pipe(first())
      .subscribe(
        (paths) => {
          this.readonlyLines$.next(
            paths.filter((path) => path.key !== this.line?.key)
          );
        },
        (err) =>
          this.notificationService.raiseNotification(
            'Could not load line paths: ' + err,
            'error'
          )
      );
  }

  toggleViewAllStations() {
    this.showAllStations = !this.showAllStations;
  }

  stationFocused(station: Station | undefined) {
    this.focusStop.emit(station);
  }
}
