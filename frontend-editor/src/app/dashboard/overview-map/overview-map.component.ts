/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { Line, Station } from '../../shared';

@Component({
  selector: 'overview-map',
  templateUrl: './overview-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'd-flex flex-grow-1' },
})
export class OverviewMapComponent {
  @Input() lines: Line[] = [];
  @Input() stations: Station[] = [];
}
