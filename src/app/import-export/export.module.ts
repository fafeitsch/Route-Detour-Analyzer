/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportComponent } from './export.component';
import { ExportRoutingModule } from './export-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ExportComponent],
  imports: [CommonModule, ExportRoutingModule, MatCardModule, MatCheckboxModule, MatButtonModule],
})
export class ExportModule {}
