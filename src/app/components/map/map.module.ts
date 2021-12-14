/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapDirective } from './map.directive';

@NgModule({
  declarations: [MapDirective],
  exports: [MapDirective],
  imports: [CommonModule],
})
export class MapModule {}
