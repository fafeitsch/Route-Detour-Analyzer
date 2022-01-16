/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapDirective } from './map.directive';
import { StationMapDirective } from './station-map.directive';

@NgModule({
  declarations: [MapDirective, StationMapDirective],
  exports: [MapDirective, StationMapDirective],
  imports: [CommonModule],
})
export class MapModule {}
