/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SettingsCardModule } from './settings-card/settings-card.module';
import { OverviewMapModule } from './overview-map/overview-map.module';
import { LinesCardModule } from './lines-card/lines-card.module';
import { MatGridListModule } from '@angular/material/grid-list';
import { ToolbarModule } from '../shared/toolbar/toolbar.module';
import { RouterModule } from '@angular/router';
import { ImportExportModule } from './import-export/import-export.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    DashboardRoutingModule,
    SettingsCardModule,
    OverviewMapModule,
    LinesCardModule,
    ToolbarModule,
    ImportExportModule,
  ],
})
export class DashboardModule {}
