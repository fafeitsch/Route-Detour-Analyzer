import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StationManagerComponent} from './station-manager.component';
import {StationManagerRoutingModule} from './station-manager-routing.module';
import {StationMapModule} from './station-map/station-map.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {StationListModule} from './station-list/station-list.module';
import {ToolbarModule} from '../shared/toolbar/toolbar.module';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [StationManagerComponent],
  imports: [
    CommonModule,
    StationManagerRoutingModule,
    StationMapModule,
    MatSidenavModule,
    StationListModule,
    ToolbarModule,
    MatButtonModule,
  ],
})
export class StationManagerModule {}
