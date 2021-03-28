import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Stop } from './route.service';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  private stopFocus = new Subject<Stop | undefined>();

  focusStop(stop: Stop) {
    this.stopFocus.next(stop);
  }

  unfocusStop() {
    this.stopFocus.next(undefined);
  }

  getFocus() {
    return this.stopFocus;
  }
}
