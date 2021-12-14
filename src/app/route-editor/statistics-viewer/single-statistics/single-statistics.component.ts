/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { Component, Input } from '@angular/core';
import { DetourWithStop } from '../statistics-viewer.store';
import { RouteEditorStore } from '../../route-editor.store';

@Component({
  selector: 'single-statistics',
  templateUrl: './single-statistics.component.html',
})
export class SingleStatisticsComponent {
  @Input() result: DetourWithStop | undefined = undefined;
  @Input() title = '';
  @Input() average = 0;
  @Input() lineColor = '';

  constructor(private readonly routeEditorStore: RouteEditorStore) {}

  overSourceStop() {
    if (!this.result) {
      return;
    }
    this.routeEditorStore.setFocusedStop$(this.result.source);
  }

  overTargetStop() {
    if (!this.result) {
      return;
    }
    this.routeEditorStore.setFocusedStop$(this.result.target);
  }

  unsetFocus() {
    this.routeEditorStore.setFocusedStop$(undefined);
  }
}
