import { Component, OnInit } from '@angular/core';
import { NotificationStore } from './notification.store';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  providers: [NotificationStore],
})
export class NotificationComponent {
  notifications$ = this.store.getNotifications$;

  constructor(private readonly store: NotificationStore) {}

  dismissNotification(index: number) {
    this.store.dismissNotification$(index);
  }
}
