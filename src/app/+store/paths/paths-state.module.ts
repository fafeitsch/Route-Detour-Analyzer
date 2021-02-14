/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { statisticsReducer } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { Effects } from './effects';

@NgModule({
  declarations: [],
  imports: [CommonModule, StoreModule.forFeature('paths', statisticsReducer), EffectsModule.forFeature([Effects])],
})
export class PathsStateModule {}
