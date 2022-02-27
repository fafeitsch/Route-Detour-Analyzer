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
import { LatLng } from '../../+store/workbench';
import { BehaviorSubject } from 'rxjs';
import { StationManagerStore } from '../station-manager.store';
import { Line, LinesService, Station } from '../../shared';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { first } from 'rxjs/operators';

@Component({
  selector: 'station-map',
  templateUrl: './station-map.component.html',
  styleUrls: ['./station-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class StationMapComponent {
  @Input() stations: Station[] = [];
  @Input() focusedStation: Station | undefined = undefined;
  @Input() centerAndZoom: (LatLng & { zoom?: number }) | undefined = undefined;

  @Output() focusStation = new EventEmitter<Station | undefined>();

  readonlyLines$ = new BehaviorSubject<Line[]>([]);

  constructor(
    private readonly stationManagerStore: StationManagerStore,
    private readonly linesService: LinesService
  ) {}

  stationDragged({ lat, lng, index }: LatLng & { index: number }) {
    console.log(index);
    this.stationManagerStore.moveStop$({ lat, lng, toChange: index });
  }

  addStop(latLng: LatLng) {
    this.stationManagerStore.addStation$(latLng);
  }

  toggleViewAll(value: MatSlideToggleChange) {
    if (!value.checked) {
      this.readonlyLines$.next([]);
      return;
    }
    this.linesService
      .getLinePaths()
      .pipe(first())
      .subscribe((paths) => this.readonlyLines$.next(paths));
  }
}
