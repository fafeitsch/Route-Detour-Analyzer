/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouteEditorStore } from '../route-editor.store';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { Station } from '../../shared';

@Component({
  selector: 'stop-list',
  templateUrl: './stop-list.component.html',
  styleUrls: ['./stop-list.component.scss'],
  host: { class: 'd-flex flex-column' },
})
export class StopListComponent {
  @Input() focusedStop: Station | undefined = undefined;

  @Output() focusStop = new EventEmitter<Station | undefined>();
  @Output() centerStop = new EventEmitter<Station>();

  line$ = this.routeEditorStore.line$.pipe(
    tap((line) =>
      this.colorControl.patchValue(line.color, { emitEvent: false })
    )
  );
  distance$ = this.routeEditorStore.totalDistance$;
  colorControl = new FormControl();

  constructor(private readonly routeEditorStore: RouteEditorStore) {
    this.routeEditorStore.changeLineColor$(this.colorControl.valueChanges);
  }

  changeStopOrder(event: { from: number; to: number }) {
    this.routeEditorStore.moveStopOfLine$(event);
  }

  deleteStop(index: number) {
    this.routeEditorStore.removeStopFromLine$(index);
    this.focusStop.emit(undefined);
  }

  setFocusedStop(station: Station | undefined) {
    this.focusStop.emit(station);
  }

  changeLineName(name: string) {
    this.routeEditorStore.changeLineName$(name);
  }

  stationClicked(station: Station) {
    this.centerStop.emit(station);
  }
}
