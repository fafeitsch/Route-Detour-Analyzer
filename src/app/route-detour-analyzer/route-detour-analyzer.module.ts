/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteDetourAnalyzerComponent } from './route-detour-analyzer.component';
import { ControlsModule } from '../sidepane/controls.module';
import { RouteDetourAnalyzerRoutingModule } from './route-detour-analyzer-routing.module';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [RouteDetourAnalyzerComponent],
  imports: [CommonModule, MatToolbarModule, RouteDetourAnalyzerRoutingModule, ControlsModule],
})
export class RouteDetourAnalyzerModule {}
