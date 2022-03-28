/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { Notification, NotificationService } from './notification.service';
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { delay, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

interface State {
  notifications: Notification[];
  overlayOpen: boolean;
  toolbarIconColor: string;
}

@Injectable()
export class NotificationStore extends ComponentStore<State> {
  readonly notifications$ = super.select((state) => state.notifications);
  readonly overlayOpen = super.select((state) => state.overlayOpen);
  readonly toolbarIconColor$ = super.select((state) => state.toolbarIconColor);

  readonly toggleOverlay = super.updater((state) => ({
    ...state,
    overlayOpen: !state.overlayOpen,
  }));

  readonly clearNotification = super.updater((state, index: number) => ({
    ...state,
    notifications: state.notifications.filter((_, i) => i !== index),
  }));

  readonly markAllAsSeen = super.updater((state) => ({
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, seen: true })),
  }));

  private readonly addNotification = super.effect(() =>
    this.service.getNotifications().pipe(
      tap((notification) =>
        super.patchState((state) => ({
          ...state,
          toolbarIconColor: notification.type,
          overlayOpen: notification.type === 'error',
          notifications: [
            { ...notification, seen: state.overlayOpen },
            ...state.notifications.splice(0, 4),
          ],
        }))
      ),
      switchMap(() =>
        of(undefined).pipe(
          delay(3_000),
          tap(() => super.patchState({ toolbarIconColor: '' }))
        )
      )
    )
  );

  constructor(private readonly service: NotificationService) {
    super({ notifications: [], overlayOpen: false, toolbarIconColor: '' });
  }
}
