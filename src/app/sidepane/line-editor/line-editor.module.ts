/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineEditorComponent } from './line-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StopEditorComponent } from './stop-editor/stop-editor.component';
import { IconsModule } from '@rda/components/icons/icons.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LineEditorComponent, StopEditorComponent, StopEditorComponent],
  imports: [
    CommonModule,
    DragDropModule,
    IconsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  exports: [LineEditorComponent],
})
export class LineEditorModule {}
