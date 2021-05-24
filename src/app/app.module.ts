/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ControlsModule } from './sidepane/controls.module';
import { HttpClientModule } from '@angular/common/http';
import { MapModule } from './map/map.module';
import { StatisticsViewerModule } from './statistics-viewer/statistics-viewer.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MapModule,
    MatSidenavModule,
    HttpClientModule,
    ControlsModule,
    StatisticsViewerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
