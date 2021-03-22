/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsComponent } from './controls.component';
import { ExternalSettingsModule } from './external-settings/external-settings.module';
import { LineEditorModule } from './line-editor/line-editor.module';
import { StatisticsViewerComponent } from './statistics-viewer/statistics-viewer.component';
import { EvaluationRangeCapModule } from './evaluation-range-cap/evaluation-range-cap.module';
import { NotificationModule } from './notification/notification.module';

@NgModule({
  declarations: [ControlsComponent, StatisticsViewerComponent],
  exports: [ControlsComponent],
  imports: [CommonModule, ExternalSettingsModule, LineEditorModule, EvaluationRangeCapModule, NotificationModule],
})
export class ControlsModule {}
