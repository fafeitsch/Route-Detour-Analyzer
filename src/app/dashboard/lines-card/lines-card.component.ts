/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { lineCreated, lineDeleted, lines, Workbench } from '../../+store/workbench';
import { Store } from '@ngrx/store';
import { freeLineName } from '../../+store/workbench/selectors';
import { Router } from '@angular/router';

@Component({
  selector: 'lines-card',
  templateUrl: './lines-card.component.html',
  styleUrls: ['./lines-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinesCardComponent {
  lines$ = this.workbenchStore.select(lines);
  nextFreeLineName$ = this.workbenchStore.select(freeLineName);

  constructor(private readonly workbenchStore: Store<Workbench>, private readonly router: Router) {}

  deleteLine(name: string) {
    this.workbenchStore.dispatch(lineDeleted({ name }));
  }

  createLine() {
    this.workbenchStore.dispatch(lineCreated());
  }
}
