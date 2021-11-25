/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineManagerComponent } from './line-manager.component';
import { InlineEditorModule } from '@rda/components/inline-editor/inline-editor.module';
import { MatButtonModule } from '@angular/material/button';
import { IconsModule } from '@rda/components/icons/icons.module';
import { DeleteButtonModule } from '@rda/components/delete-button/delete-button.module';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [LineManagerComponent],
  exports: [LineManagerComponent],
  imports: [CommonModule, InlineEditorModule, MatButtonModule, IconsModule, DeleteButtonModule, ColorPickerModule],
})
export class LineManagerModule {}
