/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StationListComponent} from './station-list.component';
import {MatIconModule} from '@angular/material/icon';
import {StationEditorModule} from './station-editor/station-editor.module';

@NgModule({
  declarations: [StationListComponent],
  exports: [StationListComponent],
  imports: [CommonModule, MatIconModule, StationEditorModule],
})
export class StationListModule {}
