/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column p-3' },
})
export class ControlsComponent {
  settingsMode: boolean = false;

  switchToSettingsMode() {
    this.settingsMode = true;
  }

  switchToNormalMode() {
    this.settingsMode = false;
  }
}
