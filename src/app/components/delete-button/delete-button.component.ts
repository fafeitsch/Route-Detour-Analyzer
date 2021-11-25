/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'delete-button',
  template:
    '<button mat-icon-button [disabled]="disabled" (click)="deleteEvent()"><icon-minus iconWidth="16"></icon-minus></button>',
})
export class DeleteButtonComponent {
  @Input() disabled = false;

  @Output() delete = new EventEmitter<void>();

  deleteEvent() {
    this.delete.emit();
  }
}
