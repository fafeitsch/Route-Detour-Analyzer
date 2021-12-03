/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteDetourAnalyzerComponent } from './route-detour-analyzer.component';
import { MapModule } from '../map/map.module';
import { ControlsModule } from '../sidepane/controls.module';
import { StatisticsViewerModule } from '../statistics-viewer/statistics-viewer.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouteDetourAnalyzerRoutingModule } from './route-detour-analyzer-routing.module';

@NgModule({
  declarations: [RouteDetourAnalyzerComponent],
  imports: [
    CommonModule,
    StatisticsViewerModule,
    MatSidenavModule,
    RouteDetourAnalyzerRoutingModule,
    ControlsModule,
    MapModule,
  ],
})
export class RouteDetourAnalyzerModule {}
