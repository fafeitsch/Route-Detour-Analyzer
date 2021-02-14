/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomThemeModule } from './custom-theme/custom-theme.module';
import { ExternalSettingsModule } from './sidepane/external-settings/external-settings.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ControlsModule } from './sidepane/controls.module';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { MapModule } from './map/map.module';
import { OptionsStateModule } from './+store/options';

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
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    OptionsStateModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
