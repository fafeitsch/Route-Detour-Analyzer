import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleStatisticsComponent } from './single-statistics.component';
import { IconsModule } from '@rda/components/icons/icons.module';

@NgModule({
  declarations: [SingleStatisticsComponent],
  exports: [SingleStatisticsComponent],
  imports: [CommonModule, IconsModule],
})
export class SingleStatisticsModule {}
