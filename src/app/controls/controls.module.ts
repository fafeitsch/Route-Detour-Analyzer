/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsComponent } from './controls.component';
import { ExternalSettingsModule } from './external-settings/external-settings.module';
import { LineEditorModule } from './line-editor/line-editor.module';

@NgModule({
  declarations: [ControlsComponent],
  exports: [ControlsComponent],
  imports: [CommonModule, ExternalSettingsModule, LineEditorModule],
})
export class ControlsModule {}
