/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimetableComponent } from './timetable.component';
import { TimetableEditorComponent } from './timetable-editor/timetable-editor.component';

const routes: Routes = [
  {
    path: ':line',
    component: TimetableComponent,
    children: [{ path: ':timetable', component: TimetableEditorComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimetableRoutingModule {}
