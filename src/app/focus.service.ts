/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Stop } from './route.service';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  private stopFocus = new Subject<(Stop & { color: string }) | undefined>();

  focusStop(stop: Stop & { color: string }) {
    this.stopFocus.next(stop);
  }

  unfocusStop() {
    this.stopFocus.next(undefined);
  }

  getFocus() {
    return this.stopFocus;
  }
}
