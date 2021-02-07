/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component, OnInit } from '@angular/core';
import { Stop } from '../../+reducers/reducers';
import { Store } from '@ngrx/store';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  removeStop,
  renameStop,
  moveStop,
  toggleRealStop,
  setFocusedStop,
  unsetFocusedStop,
} from '../../+actions/actions';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'line-editor',
  templateUrl: './line-editor.component.html',
  styleUrls: ['./line-editor.component.scss'],
})
export class LineEditorComponent {
  line$ = this.store.select('line');

  editedStops = 0;

  constructor(private store: Store<{ line: Stop[]; focusedStop: Stop | undefined }>) {}

  drop(event: CdkDragDrop<Stop[]>) {
    this.store.dispatch(moveStop({ oldIndex: event.previousIndex, newIndex: event.currentIndex }));
  }

  dropOnTrash(event: CdkDragDrop<Stop[]>) {
    this.store.dispatch(removeStop({ i: event.previousIndex }));
    this.unsetFocusedStop();
  }

  changeName(index: number, name: string) {
    this.store.dispatch(renameStop({ i: index, name }));
  }

  toggleRealStop(index: number) {
    this.store.dispatch(toggleRealStop({ i: index }));
  }

  setFocusedStop(stop: Stop) {
    this.store.dispatch(setFocusedStop({ stop }));
  }

  unsetFocusedStop() {
    this.store.dispatch(unsetFocusedStop());
  }
}
