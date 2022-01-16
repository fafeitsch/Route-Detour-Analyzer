/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StopEditorComponent } from './stop-editor.component';
import { LineStopModule } from '@rda/components/icons/line-stop.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StopEditorComponent],
  exports: [StopEditorComponent],
  imports: [CommonModule, ReactiveFormsModule, LineStopModule, MatButtonModule],
})
export class StopEditorModule {}
