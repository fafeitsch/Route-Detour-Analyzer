/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditTourPanelComponent} from './edit-tour-panel.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

@NgModule({
  declarations: [EditTourPanelComponent],
  imports: [CommonModule, MatFormFieldModule, MatButtonModule, MatInputModule, FormsModule, ReactiveFormsModule],
  exports: [EditTourPanelComponent],
})
export class EditTourPanelModule {}
