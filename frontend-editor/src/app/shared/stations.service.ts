/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RpcClientService } from './rpc-client.service';
import { Station, StationUpdate } from './types';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  constructor(private readonly rpc: RpcClientService) {}

  queryStations(includeLines: boolean = false): Observable<Station[]> {
    return this.rpc.request<Station[]>('stations', 'getStations', {
      includeLines,
    });
  }

  updateStations(update: StationUpdate) {
    return this.rpc.request<void>('stations', 'updateStations', update);
  }
}
