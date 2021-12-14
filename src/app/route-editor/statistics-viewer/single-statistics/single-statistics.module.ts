/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleStatisticsComponent } from './single-statistics.component';
import { LineStopModule } from '@rda/components/icons/line-stop.module';

@NgModule({
  declarations: [SingleStatisticsComponent],
  exports: [SingleStatisticsComponent],
  imports: [CommonModule, LineStopModule],
})
export class SingleStatisticsModule {}
