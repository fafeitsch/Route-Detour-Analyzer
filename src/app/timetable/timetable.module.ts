/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableComponent } from './timetable.component';
import { TimetableRoutingModule } from './timetable-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouteDiagramModule } from '@rda/components/route-diagram/route-diagram.module';
import { MatButtonModule } from '@angular/material/button';
import { TimetableColumnModule } from './timetable-column/timetable-column.module';
import { ToolbarModule } from '../shared/toolbar/toolbar.module';
import { TransformTimetablePipe } from './transform-timetable.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { EditTourPanelModule } from './edit-tour-panel/edit-tour-panel.module';
import { InlineEditorModule } from '@rda/components/inline-editor/inline-editor.module';

@NgModule({
  declarations: [TimetableComponent, TransformTimetablePipe],
  imports: [
    CommonModule,
    TimetableRoutingModule,
    MatSidenavModule,
    MatDialogModule,
    RouteDiagramModule,
    MatButtonModule,
    TimetableColumnModule,
    ToolbarModule,
    EditTourPanelModule,
    InlineEditorModule,
  ],
})
export class TimetableModule {}
