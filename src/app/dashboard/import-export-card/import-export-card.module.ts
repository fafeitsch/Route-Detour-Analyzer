/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportCardComponent } from './import-export-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WorkbenchDataModule } from '../../+store/workbench';

@NgModule({
  declarations: [ImportExportCardComponent],
  exports: [ImportExportCardComponent],
  imports: [CommonModule, MatCardModule, MatMenuModule, MatButtonModule, WorkbenchDataModule],
})
export class ImportExportCardModule {}
