/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimetableColumnComponent} from './timetable-column.component';
import {MatButtonModule} from '@angular/material/button';
import {InlineEditorModule} from '@rda/components/inline-editor/inline-editor.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [TimetableColumnComponent],
  exports: [TimetableColumnComponent],
  imports: [CommonModule, MatButtonModule, InlineEditorModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class TimetableColumnModule {}
