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
