/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsComponent } from './controls.component';
import { LineEditorModule } from './line-editor/line-editor.module';
import { EvaluationRangeCapModule } from './evaluation-range-cap/evaluation-range-cap.module';
import { NotificationModule } from './notification/notification.module';
import { LineManagerModule } from './line-manager/line-manager.module';
import { ImportExportModule } from './import-export/import-export.module';

@NgModule({
  declarations: [ControlsComponent],
  exports: [ControlsComponent],
  imports: [
    CommonModule,
    LineEditorModule,
    EvaluationRangeCapModule,
    NotificationModule,
    LineManagerModule,
    ImportExportModule,
  ],
})
export class ControlsModule {}
