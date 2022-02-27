/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { RpcClientService } from './rpc-client.service';
import { Observable } from 'rxjs';
import { Line } from './types';

@Injectable({
  providedIn: 'root',
})
export class LinesService {
  constructor(private readonly rpc: RpcClientService) {}

  getLine(key: string): Observable<Line> {
    return this.rpc.request<Line>('lines', 'getLine', { key });
  }

  getLines(): Observable<Line[]> {
    return this.rpc.request<Line[]>('lines', 'queryLines');
  }

  saveLine(line: Line) {
    return this.rpc.request<void>('lines', 'saveLine', line);
  }

  createLine() {
    return this.rpc.request<Line>('lines', 'createLine');
  }

  deleteLine(key: string) {
    return this.rpc.request<void>('lines', 'deleteLine', { key });
  }

  getLinePaths() {
    return this.rpc.request<Line[]>('lines', 'getLinePaths');
  }
}
