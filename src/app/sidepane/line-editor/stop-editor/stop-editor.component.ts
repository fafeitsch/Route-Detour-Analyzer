/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'stop-editor',
  templateUrl: './stop-editor.component.html',
  styleUrls: ['./stop-editor.component.scss'],
})
export class StopEditorComponent {
  @Input() stopName = '';
  @Input() isRealStop = true;
  @Input() isFirstStop = false;
  @Input() isLastStop = false;
  @Output() enterEditMode = new EventEmitter<void>();
  @Output() leaveEditMode = new EventEmitter<void>();
  @Output() changeName = new EventEmitter<string>();
  @Output() toggleRealStop = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  deleteStop() {
    this.delete.emit();
  }
}
