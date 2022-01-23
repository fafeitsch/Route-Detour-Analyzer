/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationCardComponent } from './station-card.component';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StationCardComponent],
  exports: [StationCardComponent],
  imports: [CommonModule, MatCardModule, RouterModule, MatButtonModule],
})
export class StationCardModule {}
