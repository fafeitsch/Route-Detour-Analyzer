/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSettingsComponent } from './app-settings.component';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppSettingsComponent],
  exports: [AppSettingsComponent],
  imports: [CommonModule, ReactiveFormsModule, MatInputModule],
})
export class AppSettingsModule {}
