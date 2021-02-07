/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { MapComponent } from './map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomThemeModule } from './custom-theme/custom-theme.module';
import { ExternalSettingsModule } from './controls/external-settings/external-settings.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ControlsModule } from './controls/controls.module';
import { environment } from '../environments/environment';
import { focusedStopReducer, lineReducer, osrmServerReducer, tileServerReducer } from './+reducers/reducers';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { LineEffects } from './+effects/line.effects';

@NgModule({
  declarations: [AppComponent, MapComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({}, {}),
    BrowserAnimationsModule,
    CustomThemeModule,
    ExternalSettingsModule,
    MatSidenavModule,
    HttpClientModule,
    ControlsModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreModule.forRoot({
      tileServer: tileServerReducer,
      osrmServer: osrmServerReducer,
      line: lineReducer,
      focusedStop: focusedStopReducer,
    }),
    EffectsModule.forRoot([LineEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
