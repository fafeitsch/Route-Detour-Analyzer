/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomThemeModule } from './custom-theme/custom-theme.module';
import { ExternalSettingsModule } from './sidepane/external-settings/external-settings.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ControlsModule } from './sidepane/controls.module';
import { HttpClientModule } from '@angular/common/http';
import { MapModule } from './map/map.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CustomThemeModule,
    ExternalSettingsModule,
    MapModule,
    MatSidenavModule,
    HttpClientModule,
    ControlsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
