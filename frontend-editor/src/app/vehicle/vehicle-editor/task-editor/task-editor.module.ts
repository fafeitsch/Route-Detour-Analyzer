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
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TaskEditorComponent],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MapModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  exports: [TaskEditorComponent],
})
export class TaskEditorModule {}
