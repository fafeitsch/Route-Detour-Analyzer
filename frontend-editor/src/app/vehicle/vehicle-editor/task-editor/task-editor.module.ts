/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskEditorComponent } from './task-editor.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MapModule } from '@rda/components/map/map.module';
import { MatButtonModule } from '@angular/material/button';
import { TourSelectorModule } from './tour-selector/tour-selector.module';
import { RoamingEditorModule } from './roaming-editor/roaming-editor.module';

@NgModule({
  declarations: [TaskEditorComponent],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MapModule,
    MatButtonModule,
    TourSelectorModule,
    RoamingEditorModule,
  ],
  exports: [TaskEditorComponent],
})
export class TaskEditorModule {}
