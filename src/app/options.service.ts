import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OptionsService {
  private cap = new BehaviorSubject<number>(0);
  private osrmUrl = new BehaviorSubject<string>(environment.osrmServerUrl);
  private tileServerUrl = new BehaviorSubject<string>(environment.tileServerUrl);

  setCap(cap: number) {
    this.cap.next(cap);
  }

  setOsrmUrl(url: string) {
    this.osrmUrl.next(url);
  }

  setTileServerUrl(url: string) {
    this.tileServerUrl.next(url);
  }

  getCap() {
    return this.cap;
  }

  getOsrmUrl() {
    return this.osrmUrl;
  }

  getTileServerUrl() {
    return this.tileServerUrl;
  }
}
