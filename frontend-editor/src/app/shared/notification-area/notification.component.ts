/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { NotificationStore } from './notifications.store';

@Component({
  selector: 'notification-area',
  templateUrl: 'notification.component.html',
  styleUrls: ['notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [NotificationStore],
})
export class NotificationComponent {
  notifications$ = this.store.notifications$;
  showOverlay$ = this.store.overlayOpen;
  toolbarIconColor$ = this.store.toolbarIconColor$;

  constructor(private readonly store: NotificationStore) {}

  toggleOverlay() {
    this.store.toggleOverlay();
    this.store.markAllAsSeen();
  }

  clearNotification(index: number) {
    this.store.clearNotification(index);
  }
}
