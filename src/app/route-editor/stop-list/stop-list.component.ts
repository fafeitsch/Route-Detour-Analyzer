/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Stop } from '../../route.service';
import { RouteEditorStore } from '../route-editor.store';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'stop-list',
  templateUrl: './stop-list.component.html',
  styleUrls: ['./stop-list.component.scss'],
  host: { class: 'd-flex flex-column' },
})
export class StopListComponent {
  line$ = this.routeEditorStore.line$.pipe(tap(line => this.colorControl.patchValue(line.color, { emitEvent: false })));
  distance$ = this.routeEditorStore.totalDistance$;
  focusedStop$ = this.routeEditorStore.focusedStop$;
  colorControl = new FormControl();

  editedStops = 0;

  constructor(private readonly routeEditorStore: RouteEditorStore) {
    this.routeEditorStore.changeLineColor$(this.colorControl.valueChanges);
  }

  drop(event: CdkDragDrop<Stop[]>) {
    this.routeEditorStore.moveStopOfLine$({ from: event.previousIndex, to: event.currentIndex });
  }

  deleteStop(index: number) {
    this.routeEditorStore.removeStopFromLine$(index);
    this.unsetFocusedStop();
  }

  changeName(index: number, name: string) {
    this.routeEditorStore.renameStop$([index, name]);
  }

  toggleRealStop(index: number) {
    this.routeEditorStore.toggleStopOfLine$(index);
  }

  setFocusedStop(index: number) {
    this.routeEditorStore.setFocusedStop$(index);
  }

  unsetFocusedStop() {
    this.routeEditorStore.setFocusedStop$(undefined);
  }

  changeLineName(name: string) {
    this.routeEditorStore.changeLineName$(name);
  }
}
