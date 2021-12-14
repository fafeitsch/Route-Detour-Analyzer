/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { WorkbenchReducer } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { WorkbenchEffects } from './effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('workbench', WorkbenchReducer),
    EffectsModule.forFeature([WorkbenchEffects]),
  ],
})
export class WorkbenchDataModule {}
