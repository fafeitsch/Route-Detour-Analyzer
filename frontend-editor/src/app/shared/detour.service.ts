/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RpcClientService } from './rpc-client.service';
import { DetourResult, Line } from './types';

@Injectable({ providedIn: 'root' })
export class DetourService {
  constructor(private readonly rpc: RpcClientService) {}

  queryDetours(line: Line, cap: number): Observable<DetourResult> {
    return this.rpc.request('osrm', 'computeDetours', {
      stations: line.stations,
      path: line.path,
      cap,
    });
  }
}
