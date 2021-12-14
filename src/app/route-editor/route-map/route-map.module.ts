/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteMapComponent } from './route-map.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapModule } from '@rda/components/map/map.module';

@NgModule({
  declarations: [RouteMapComponent],
  exports: [RouteMapComponent],
  imports: [CommonModule, MatSlideToggleModule, MapModule],
})
export class RouteMapModule {}
