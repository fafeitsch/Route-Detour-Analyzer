/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'inline-editor',
  templateUrl: './inline-editor.component.html',
  host: { class: 'd-flex align-items-flex-center w-100' },
  styles: ['.text{max-width: 240px}'],
})
export class InlineEditorComponent {
  @Input() text = '';
  @Input() emptyPlaceholder = '';
  @Output() enterEditMode = new EventEmitter<void>();
  @Output() leaveEditMode = new EventEmitter<void>();
  @Output() changeText = new EventEmitter<string>();

  nameFormControl = new FormControl('');
  editMode = false;

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.nameFormControl.patchValue(this.text);
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
    this.changeText.emit(this.nameFormControl.value);
    this.leaveEditMode.emit();
  }
}
