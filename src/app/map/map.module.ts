import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { PathsStateModule } from '../+store/paths/paths-state.module';
import { FocusStateModule } from '../+store/focus/focus-state.module';
import { LineStateModule } from '../+store/line';

@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [CommonModule, PathsStateModule, FocusStateModule, LineStateModule],
})
export class MapModule {}
