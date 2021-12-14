/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { lines, Workbench } from '../../+store/workbench';
import { Store } from '@ngrx/store';

@Component({
  selector: 'overview-map',
  templateUrl: './overview-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'd-flex flex-grow-1' },
})
export class OverviewMapComponent {
  lines$ = this.store.select(lines);

  constructor(private readonly store: Store<Workbench>) {}
}
