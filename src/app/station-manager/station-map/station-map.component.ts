/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Domain, LatLng, lines, Station, Workbench } from '../../+store/workbench';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { StationManagerStore } from '../station-manager.store';
import Line = Domain.Line;

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

  private line$ = new BehaviorSubject<Line | undefined>(undefined);
  showAllLines = false;
  readonlyLines$ = combineLatest([this.store.select(lines), this.line$]).pipe(
    map(([lines, line]) => lines.filter(l => l.name !== line?.name))
  );

  constructor(private readonly stationManagerStore: StationManagerStore, private readonly store: Store<Workbench>) {}

  stationDragged(drag: LatLng & { key: string }) {
    this.stationManagerStore.moveStop$(drag);
  }

  addStop(latLng: LatLng) {
    this.stationManagerStore.addStation$(latLng);
  }

  toggleViewAll() {
    this.showAllLines = !this.showAllLines;
  }
}
