/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleComponent } from './vehicle.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EntityListModule } from '@rda/components/entity-list/entity-list.module';
import { RouterModule } from '@angular/router';
import { VehicleRoutingModule } from './vehicle-routing.module';

@NgModule({
  declarations: [VehicleComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    EntityListModule,
    RouterModule,
    VehicleRoutingModule,
  ],
})
export class VehicleModule {}
