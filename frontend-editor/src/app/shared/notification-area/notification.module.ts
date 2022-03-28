/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './notification.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule,
    OverlayModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  exports: [NotificationComponent],
})
export class NotificationModule {}
