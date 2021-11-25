/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly subject = new Subject<string>();

  getNotifications(): Observable<string> {
    return this.subject;
  }

  raiseNotification(message: string) {
    this.subject.next(message);
  }
}
