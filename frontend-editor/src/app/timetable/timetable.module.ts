/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimetableComponent } from './timetable.component';
import { TimetableRoutingModule } from './timetable-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TransformTimetablePipe } from './transform-timetable.pipe';
import { TimetableEditorModule } from './timetable-editor/timetable-editor.module';
import { EntityListModule } from '@rda/components/entity-list/entity-list.module';

@NgModule({
  declarations: [TimetableComponent, TransformTimetablePipe],
  imports: [
    CommonModule,
    TimetableRoutingModule,
    MatSidenavModule,
    TimetableEditorModule,
    EntityListModule,
  ],
})
export class TimetableModule {}
