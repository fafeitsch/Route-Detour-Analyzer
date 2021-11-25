/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsViewerComponent } from './statistics-viewer.component';
import { SingleStatisticsModule } from './single-statistics/single-statistics.module';
import { AppSettingsModule } from './app-settings/app-settings.module';

@NgModule({
  declarations: [StatisticsViewerComponent],
  exports: [StatisticsViewerComponent],
  imports: [CommonModule, SingleStatisticsModule, AppSettingsModule],
})
export class StatisticsViewerModule {}
