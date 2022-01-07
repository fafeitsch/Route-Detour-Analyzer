/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationEditorComponent } from './station-editor.component';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InlineEditorModule } from '@rda/components/inline-editor/inline-editor.module';

@NgModule({
  declarations: [StationEditorComponent],
  exports: [StationEditorComponent],
  imports: [CommonModule, MatButtonModule, NgSelectModule, MatTooltipModule, InlineEditorModule],
})
export class StationEditorModule {}
