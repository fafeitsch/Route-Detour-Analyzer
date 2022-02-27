/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Station } from '../../shared';

@Component({
  selector: 'station-card',
  templateUrl: './station-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationCardComponent {
  @Input() stations: Station[] = [];
  @Input() waypoints: Station[] = [];
}
