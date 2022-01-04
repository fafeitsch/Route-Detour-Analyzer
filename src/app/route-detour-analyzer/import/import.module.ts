import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportComponent } from './import.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [ImportComponent],
  exports: [ImportComponent],
  imports: [CommonModule, MatButtonModule, MatMenuModule],
})
export class ImportModule {}
