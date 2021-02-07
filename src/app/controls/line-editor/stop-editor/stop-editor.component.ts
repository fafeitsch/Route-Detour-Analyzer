/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'stop-editor',
  templateUrl: './stop-editor.component.html',
  styleUrls: ['./stop-editor.component.scss'],
})
export class StopEditorComponent {
  @Input() stopName = '';
  @Input() isRealStop = true;
  @Output() enterEditMode = new EventEmitter<void>();
  @Output() leaveEditMode = new EventEmitter<void>();
  @Output() changeName = new EventEmitter<string>();
  @Output() toggleRealStop = new EventEmitter<void>();

  nameFormControl = new FormControl('');
  editMode = false;

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.nameFormControl.patchValue(this.stopName);
      this.enterEditMode.emit();
    } else {
      this.leaveEditMode.emit();
    }
  }

  inputKeyPressed(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.commit();
    }
  }
  commit() {
    this.editMode = false;
    this.changeName.emit(this.nameFormControl.value);
    this.leaveEditMode.emit();
  }
}
