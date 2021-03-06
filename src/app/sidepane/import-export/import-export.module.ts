/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportComponent } from './import-export.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ImportExportComponent],
  exports: [ImportExportComponent],
  imports: [CommonModule, MatButtonModule],
})
export class ImportExportModule {}
