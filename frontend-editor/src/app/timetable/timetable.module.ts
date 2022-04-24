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
import { TransformTimetablePipe } from './transform-timetable.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { InlineEditorModule } from '@rda/components/inline-editor/inline-editor.module';
import { TimetableListComponent } from './timetable-list/timetable-list.component';
import { MatIconModule } from '@angular/material/icon';
import { TimetableEditorModule } from './timetable-editor/timetable-editor.module';

@NgModule({
  declarations: [
    TimetableComponent,
    TransformTimetablePipe,
    TimetableListComponent,
  ],
  imports: [
    CommonModule,
    TimetableRoutingModule,
    MatSidenavModule,
    MatDialogModule,
    RouteDiagramModule,
    MatButtonModule,
    InlineEditorModule,
    MatIconModule,
    TimetableEditorModule,
  ],
})
export class TimetableModule {}
