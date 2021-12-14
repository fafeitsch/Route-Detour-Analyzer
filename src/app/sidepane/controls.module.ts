/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsComponent } from './controls.component';
import { NotificationModule } from './notification/notification.module';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [ControlsComponent],
  exports: [ControlsComponent],
  imports: [CommonModule, MatTabsModule, NotificationModule],
})
export class ControlsModule {}
