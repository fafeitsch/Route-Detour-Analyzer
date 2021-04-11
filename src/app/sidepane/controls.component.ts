/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column p-3 ov-hidden' },
})
export class ControlsComponent {
  mode: 'normal' | 'settings' | 'lines' = 'normal';

  switchToSettingsMode() {
    this.mode = 'settings';
  }

  switchToNormalMode() {
    this.mode = 'normal';
  }

  switchToLinesMode() {
    this.mode = 'lines';
  }
}
