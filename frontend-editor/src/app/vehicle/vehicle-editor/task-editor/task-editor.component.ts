/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { LatLng, timeFormatValidator, TimeString } from '../../../shared';
import { TaskEditorStore } from './task-editor-store';
import { merge, Observable } from 'rxjs';
import { isDefined } from '../../../shared/utils';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'task-editor',
  templateUrl: './task-editor.component.html',
  styleUrls: ['./task-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TaskEditorStore],
  host: { class: 'd-flex h-100 flex-column flex-gap-2' },
})
export class TaskEditorComponent {
  @Input() editMode = false;

  @Input() set lastPosition(position: LatLng | undefined) {
    this.store.setStart(position);
  }

  @Output() saveTask = merge(this.store.task$).pipe(isDefined());

  type: 'roaming' | 'line' = 'roaming';
  path$ = this.store.fakeLine$;
  lastPosition$ = this.store.start$;
  startTimeControl = new FormControl('0:00', [timeFormatValidator()]);

  constructor(private readonly store: TaskEditorStore) {
    store.setStartTime(
      this.startTimeControl.valueChanges as Observable<TimeString>
    );
  }

  toggleType() {
    this.type = this.type === 'roaming' ? 'line' : 'roaming';
  }

  endSelected(target: LatLng) {
    this.store.setEnd(target);
  }

  save() {
    this.store.commit$();
  }
}
