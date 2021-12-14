/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsViewerComponent } from './statistics-viewer.component';
import { SingleStatisticsModule } from './single-statistics/single-statistics.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [StatisticsViewerComponent],
  exports: [StatisticsViewerComponent],
  imports: [CommonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, SingleStatisticsModule],
})
export class StatisticsViewerModule {}
