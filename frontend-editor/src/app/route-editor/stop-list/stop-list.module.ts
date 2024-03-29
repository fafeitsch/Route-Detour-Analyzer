/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StopListComponent} from './stop-list.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import {InlineEditorModule} from '@rda/components/inline-editor/inline-editor.module';
import {RouteDiagramModule} from '@rda/components/route-diagram/route-diagram.module';

@NgModule({
  declarations: [StopListComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    InlineEditorModule,
    RouteDiagramModule,
  ],
  exports: [StopListComponent],
})
export class StopListModule {}
