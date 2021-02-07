/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalSettingsComponent } from './external-settings.component';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoButtonModule } from '@rda/components/info-button/info-button.module';

@NgModule({
  declarations: [ExternalSettingsComponent],
  exports: [ExternalSettingsComponent],
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltipModule, InfoButtonModule],
})
export class ExternalSettingsModule {}
