/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteButtonComponent } from './delete-button.component';
import { MatButtonModule } from '@angular/material/button';
import { IconsModule } from '@rda/components/icons/icons.module';

@NgModule({
  declarations: [DeleteButtonComponent],
  exports: [DeleteButtonComponent],
  imports: [CommonModule, MatButtonModule, IconsModule],
})
export class DeleteButtonModule {}
