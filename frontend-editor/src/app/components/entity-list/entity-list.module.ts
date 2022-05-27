/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityListComponent } from './entity-list.component';
import { InlineEditorModule } from '@rda/components/inline-editor/inline-editor.module';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EntityListComponent],
  imports: [
    CommonModule,
    InlineEditorModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [EntityListComponent],
})
export class EntityListModule {}
