import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoamingEditorComponent } from './roaming-editor.component';
import { MapModule } from '@rda/components/map/map.module';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [RoamingEditorComponent],
  exports: [RoamingEditorComponent],
  imports: [CommonModule, MapModule, MatInputModule, ReactiveFormsModule],
})
export class RoamingEditorModule {}
