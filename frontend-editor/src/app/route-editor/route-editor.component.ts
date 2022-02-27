/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteEditorStore } from './route-editor.store';
import { Station } from '../shared';

@Component({
  selector: 'route-editor',
  templateUrl: './route-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100' },
  providers: [RouteEditorStore],
})
export class RouteEditorComponent {
  selectedLine$ = this.store.line$;
  focusedStop: Station | undefined = undefined;
  centeredStop: Station | undefined = undefined;
  uncommitedChanges$ = this.store.uncommitedChanges$;
  lineError$ = this.store.lineError$;

  constructor(private readonly store: RouteEditorStore) {}

  commitChanges() {
    this.store.commitChanges$();
  }

  focusStation(station: Station | undefined) {
    this.focusedStop = station;
  }

  centerOnStation(station: Station | undefined) {
    this.centeredStop = station;
  }
}
