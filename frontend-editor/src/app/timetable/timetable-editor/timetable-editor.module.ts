/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableEditorComponent } from './timetable-editor.component';
import { RouteDiagramModule } from '@rda/components/route-diagram/route-diagram.module';
import { TimetableColumnModule } from './timetable-column/timetable-column.module';
import { EditTourPanelModule } from './edit-tour-panel/edit-tour-panel.module';
import { PortalModule } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [TimetableEditorComponent],
  imports: [
    CommonModule,
    RouteDiagramModule,
    TimetableColumnModule,
    EditTourPanelModule,
    PortalModule,
    MatButtonModule,
  ],
  exports: [TimetableEditorComponent],
})
export class TimetableEditorModule {}
