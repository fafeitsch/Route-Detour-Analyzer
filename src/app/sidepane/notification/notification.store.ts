/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { NotificationService } from '../../notification.service';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Notification {
  message: string;
  counter: number;
}

interface State {
  notifications: Notification[];
}

@Injectable()
export class NotificationStore extends ComponentStore<State> {
  readonly getNotifications$ = super.select(state => state.notifications);

  readonly addNotification$ = super.updater((state, message: string) => {
    let lastNotification = state.notifications[state.notifications.length - 1];
    if (lastNotification?.message === message) {
      lastNotification.counter = lastNotification.counter + 1;
      return { ...state, notifications: [...state.notifications] };
    }
    return { ...state, notifications: [...state.notifications, { message, counter: 1 }] };
  });

  readonly deleteNotification$ = super.updater((state, index: number) => {
    state.notifications.splice(index, 1);
    return { ...state, notifications: state.notifications };
  });

  readonly addNotification = super.effect(() =>
    this.service.getNotifications().pipe(tap(message => this.addNotification$(message)))
  );

  readonly dismissNotification$ = super.effect((index$: Observable<number>) =>
    index$.pipe(tap(this.deleteNotification$))
  );

  constructor(private readonly service: NotificationService) {
    super({ notifications: [] });
  }
}
