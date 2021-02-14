/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoButtonComponent } from './info-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [InfoButtonComponent],
  exports: [InfoButtonComponent],
  imports: [CommonModule, MatButtonModule, MatTooltipModule],
})
export class InfoButtonModule {}
