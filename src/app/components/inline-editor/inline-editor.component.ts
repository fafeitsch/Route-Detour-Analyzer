/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'inline-editor',
  templateUrl: './inline-editor.component.html',
  host: { class: 'd-flex align-items-flex-center w-100 ov-hidden' },
  styles: ['.text{cursor: text}'],
})
export class InlineEditorComponent {
  @Input() text = '';
  @Input() emptyPlaceholder = '';
  @Input() additionalActionLabel: string | undefined = undefined;
  @Output() enterEditMode = new EventEmitter<void>();
  @Output() leaveEditMode = new EventEmitter<void>();
  @Output() changeText = new EventEmitter<string>();
  @Output() additionalAction = new EventEmitter<void>();

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
    event.stopPropagation();
    if (event.key === 'Enter') {
      this.commit();
    }
    if (event.key === 'Escape') {
      this.editMode = false;
      this.leaveEditMode.emit();
    }
  }

  commit() {
    this.editMode = false;
    this.changeText.emit(this.nameFormControl.value);
    this.leaveEditMode.emit();
  }

  clickedAdditionalAction() {
    this.additionalAction.emit();
  }
}
