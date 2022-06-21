/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { RpcClientService } from './rpc-client.service';
import { Observable } from 'rxjs';
import { Center } from './types';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PropertiesService {
  private centerRequest: Observable<Center> | undefined = undefined;

  constructor(private readonly rpc: RpcClientService) {}

  getCenter() {
    if (!this.centerRequest) {
      this.centerRequest = this.rpc
        .request<Center>('properties', 'getCenter')
        .pipe(shareReplay(1));
    }
    return this.centerRequest;
  }
}
