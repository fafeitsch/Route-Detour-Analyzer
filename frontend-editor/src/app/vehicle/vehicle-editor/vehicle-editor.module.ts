/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleEditorComponent } from './vehicle-editor.component';
import { TaskEditorModule } from './task-editor/task-editor.module';
import { PortalModule } from '@angular/cdk/portal';
import { MapModule } from '@rda/components/map/map.module';
import { ToolbarModule } from '../../shared/toolbar/toolbar.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [VehicleEditorComponent],
  imports: [
    CommonModule,
    TaskEditorModule,
    PortalModule,
    MapModule,
    ToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class VehicleEditorModule {}
