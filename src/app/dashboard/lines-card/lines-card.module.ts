/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinesCardComponent } from './lines-card.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [LinesCardComponent],
  exports: [LinesCardComponent],
  imports: [CommonModule, MatCardModule],
})
export class LinesCardModule {}
