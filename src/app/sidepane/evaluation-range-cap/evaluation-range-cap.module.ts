/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationRangeCapComponent } from './evaluation-range-cap.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InfoButtonModule } from '@rda/components/info-button/info-button.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaxPipePipe } from './max-pipe.pipe';

@NgModule({
  declarations: [EvaluationRangeCapComponent, MaxPipePipe],
  exports: [EvaluationRangeCapComponent],
  imports: [CommonModule, MatFormFieldModule, MatInputModule, InfoButtonModule, ReactiveFormsModule],
})
export class EvaluationRangeCapModule {}
