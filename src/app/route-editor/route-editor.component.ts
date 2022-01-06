/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouteEditorStore } from './route-editor.store';

@Component({
  selector: 'route-editor',
  templateUrl: './route-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100' },
  providers: [RouteEditorStore],
})
export class RouteEditorComponent {
  selectedLine$ = this.store.line$;
  focusedStop$ = this.store.focusedStop$;
  uncommitedChanges$ = this.store.uncommitedChanges$;
  lineError$ = this.store.lineError$;

  constructor(private readonly store: RouteEditorStore) {}

  commitChanges() {
    this.store.commitChanges$();
  }
}
