/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { LatLng, Task } from '../../../shared';

@Component({
  selector: 'task-editor',
  templateUrl: './task-editor.component.html',
  styleUrls: ['./task-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex h-100 flex-column gap-2' },
})
export class TaskEditorComponent {
  @Input() editMode = false;

  @Input() lastPosition: LatLng | undefined = undefined;

  @Output() saveTask = new EventEmitter<Task>();

  type: 'roaming' | 'line' = 'roaming';
  task: Task | undefined = undefined;

  toggleType() {
    this.task = undefined;
    this.type = this.type === 'roaming' ? 'line' : 'roaming';
  }

  taskSelected(task: Task) {
    this.task = task;
  }

  save() {
    this.saveTask.emit(this.task);
  }
}
