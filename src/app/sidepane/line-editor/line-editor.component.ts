/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {Component} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {FocusService} from '../../focus.service';
import {LineStore} from '../../line.store';
import {Stop} from '../../route.service';

@Component({
  selector: 'line-editor',
  templateUrl: './line-editor.component.html',
  styleUrls: ['./line-editor.component.scss'],
  host: { class: 'd-flex flex-column' },
})
export class LineEditorComponent {
  line$ = this.lineStore.selectedLine$;
  distance$ = this.lineStore.totalDistance$;

  editedStops = 0;

  constructor(private readonly lineStore: LineStore, private focusService: FocusService) {}

  drop(event: CdkDragDrop<Stop[]>) {
    this.lineStore.moveStopOfLine$({from: event.previousIndex, to: event.currentIndex});
  }

  deleteStop(index: number) {
    this.lineStore.removeStopFromLine$(index);
    this.unsetFocusedStop();
  }

  changeName(index: number, name: string) {
    this.lineStore.renameStop$([index, name]);
  }

  toggleRealStop(index: number) {
    this.lineStore.toggleStopOfLine$(index);
  }

  setFocusedStop(stop: Stop, color: string) {
    this.focusService.focusStop({ ...stop, color });
  }

  unsetFocusedStop() {
    this.focusService.unfocusStop();
  }
}
