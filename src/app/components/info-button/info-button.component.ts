/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';

@Component({
  selector: 'info-button',
  templateUrl: './info-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoButtonComponent {
  size = 30;
  @Input() info = '';
}
