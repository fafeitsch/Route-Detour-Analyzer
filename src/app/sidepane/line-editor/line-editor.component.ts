/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FocusService } from '../../focus.service';
import { LineStore } from '../../line.store';
import { Stop } from '../../route.service';

@Component({
  selector: 'line-editor',
  templateUrl: './line-editor.component.html',
  styleUrls: ['./line-editor.component.scss'],
  host: { class: 'd-flex flex-column' },
})
export class LineEditorComponent {
  selectedLine$ = this.lineStore.getSelectedLine$;
  line$ = this.lineStore.getLine$;
  distance$ = this.lineStore.getTotalDistance$;

  editedStops = 0;

  constructor(private readonly lineStore: LineStore, private focusService: FocusService) {}

  drop(event: CdkDragDrop<Stop[]>) {
    this.lineStore.moveStop$([event.previousIndex, event.currentIndex]);
  }

  deleteStop(index: number) {
    this.lineStore.removeStop$(index);
    this.unsetFocusedStop();
  }

  changeName(index: number, name: string) {
    this.lineStore.renameStop$([index, name]);
  }

  toggleRealStop(index: number) {
    this.lineStore.toggleRealStop$(index);
  }

  setFocusedStop(stop: Stop) {
    this.focusService.focusStop(stop);
  }

  unsetFocusedStop() {
    this.focusService.unfocusStop();
  }
}
