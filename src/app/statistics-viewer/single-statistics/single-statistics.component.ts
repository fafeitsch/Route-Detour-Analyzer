/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { Component, Input } from '@angular/core';
import { DetourWithStop } from '../statistics-viewer.store';
import { FocusService } from '../../focus.service';

@Component({
  selector: 'single-statistics',
  templateUrl: './single-statistics.component.html',
})
export class SingleStatisticsComponent {
  @Input() result: DetourWithStop | undefined = undefined;
  @Input() title = '';
  @Input() average = 0;
  @Input() lineColor = '';

  constructor(private readonly focusService: FocusService) {}

  overSourceStop() {
    if (!this.result) {
      return;
    }
    this.focusService.focusStop({ ...this.result.sourceStop, color: this.result.color });
  }

  overTargetStop() {
    if (!this.result) {
      return;
    }
    this.focusService.focusStop({ ...this.result.targetStop, color: this.result.color });
  }

  unsetFocus() {
    this.focusService.unfocusStop();
  }
}
