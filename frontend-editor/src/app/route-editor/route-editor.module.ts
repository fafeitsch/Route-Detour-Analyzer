/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouteEditorComponent} from './route-editor.component';
import {RouteEditorRoutingModule} from './route-editor-routing.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {StopListModule} from './stop-list/stop-list.module';
import {RouteMapModule} from './route-map/route-map.module';
import {MatButtonModule} from '@angular/material/button';
import {StatisticsViewerModule} from './statistics-viewer/statistics-viewer.module';
import {ToolbarModule} from '../shared/toolbar/toolbar.module';

@NgModule({
  declarations: [RouteEditorComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    RouteEditorRoutingModule,
    StopListModule,
    RouteMapModule,
    StatisticsViewerModule,
    ToolbarModule,
  ],
})
export class RouteEditorModule {}
