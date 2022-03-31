/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewMapComponent } from './overview-map.component';
import { MapModule } from '@rda/components/map/map.module';

@NgModule({
  declarations: [OverviewMapComponent],
  exports: [OverviewMapComponent],
  imports: [CommonModule, MapModule],
})
export class OverviewMapModule {}
