/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineEditorComponent } from './inline-editor.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconsModule } from '@rda/components/icons/icons.module';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [InlineEditorComponent],
  exports: [InlineEditorComponent],
  imports: [CommonModule, MatFormFieldModule, IconsModule, MatButtonModule, MatInputModule, ReactiveFormsModule],
})
export class InlineEditorModule {}
