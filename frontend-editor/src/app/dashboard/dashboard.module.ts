/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { OverviewMapModule } from './overview-map/overview-map.module';
import { LinesCardModule } from './lines-card/lines-card.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { ToolbarModule } from '../shared/toolbar/toolbar.module';
import { RouterModule } from '@angular/router';
import { StationCardModule } from './station-card/station-card.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatButtonModule,
    DashboardRoutingModule,
    OverviewMapModule,
    LinesCardModule,
    ToolbarModule,
    StationCardModule,
  ],
})
export class DashboardModule {}
