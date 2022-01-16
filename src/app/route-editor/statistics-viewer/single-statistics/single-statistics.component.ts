/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DetourWithStop } from '../statistics-viewer.store';
import { RouteEditorStore } from '../../route-editor.store';
import { Station } from '../../../+store/workbench';

@Component({
  selector: 'single-statistics',
  templateUrl: './single-statistics.component.html',
})
export class SingleStatisticsComponent {
  @Input() result: DetourWithStop | undefined = undefined;
  @Input() title = '';
  @Input() average = 0;
  @Input() lineColor = '';
  @Input() focusedStop: Station | undefined = undefined;

  @Output() focusStop = new EventEmitter<Station | undefined>();
  @Output() centerStop = new EventEmitter<Station>();

  constructor(private readonly routeEditorStore: RouteEditorStore) {}

  overSourceStop() {
    if (!this.result) {
      return;
    }
    this.focusStop.emit(this.result.sourceStop);
  }

  overTargetStop() {
    if (!this.result) {
      return;
    }
    this.focusStop.emit(this.result.targetStop);
  }

  unsetFocus() {
    this.focusStop.emit(undefined);
  }

  clickStation(station: Station) {
    if (station) {
      this.centerStop.emit(station);
    }
  }
}
