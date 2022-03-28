/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteDetourAnalyzerComponent } from './route-detour-analyzer.component';
import { RouteDetourAnalyzerRoutingModule } from './route-detour-analyzer-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ToolbarModule } from '../shared/toolbar/toolbar.module';
import { NotificationModule } from '../shared/notification-area/notification.module';

@NgModule({
  declarations: [RouteDetourAnalyzerComponent],
  imports: [
    CommonModule,
    MatToolbarModule,
    RouteDetourAnalyzerRoutingModule,
    ToolbarModule,
    NotificationModule,
  ],
})
export class RouteDetourAnalyzerModule {}
