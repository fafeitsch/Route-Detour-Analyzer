/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouteDiagramComponent} from './route-diagram.component';
import {LineStopModule} from '@rda/components/icons/line-stop.module';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [RouteDiagramComponent],
  exports: [RouteDiagramComponent],
  imports: [CommonModule, DragDropModule, LineStopModule],
})
export class RouteDiagramModule {}
