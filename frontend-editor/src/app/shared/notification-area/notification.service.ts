/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Notification {
  text: string;
  type: 'error' | 'success' | 'neutral';
  seen: boolean;
  time: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly subject = new Subject<Notification>();

  getNotifications(): Observable<Notification> {
    return this.subject;
  }

  raiseNotification(
    text: string,
    type: 'error' | 'success' | 'neutral' = 'error'
  ) {
    this.subject.next({ text, type, seen: false, time: new Date() });
  }
}
