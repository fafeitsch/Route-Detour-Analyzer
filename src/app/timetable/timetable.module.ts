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

@NgModule({
  declarations: [TimetableComponent],
  imports: [CommonModule, TimetableRoutingModule, MatSidenavModule, RouteDiagramModule],
})
export class TimetableModule {}
