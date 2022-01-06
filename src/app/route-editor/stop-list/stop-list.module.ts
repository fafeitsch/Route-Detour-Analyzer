/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopListComponent } from './stop-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StopEditorComponent } from './stop-editor/stop-editor.component';
import { LineStopModule } from '@rda/components/icons/line-stop.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { InlineEditorModule } from '@rda/components/inline-editor/inline-editor.module';

@NgModule({
  declarations: [StopListComponent, StopEditorComponent, StopEditorComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    InlineEditorModule,
    DragDropModule,
    LineStopModule,
  ],
  exports: [StopListComponent],
})
export class StopListModule {}
