/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { RpcClientService } from './rpc-client.service';
import { Timetable } from './types';

@Injectable({
  providedIn: 'root',
})
export class TimetableService {
  constructor(private rpc: RpcClientService) {}

  getTimetablesForLine(key: string) {
    return this.rpc.request<Timetable[]>('timetables', 'getTimetablesForLine', {
      key,
    });
  }

  getTimetable(key: string) {
    return this.rpc.request<Timetable>('timetables', 'getTimetable', { key });
  }

  saveTimetableMetadata(timetable: Partial<Timetable>) {
    return this.rpc.request<Timetable>(
      'timetables',
      'saveTimetableMetadata',
      timetable
    );
  }

  saveTimetable(timetable: Partial<Timetable>) {
    return this.rpc.request<Timetable>(
      'timetables',
      'saveTimetable',
      timetable
    );
  }

  deleteTimetable(key: string) {
    return this.rpc.request<void>('timetables', 'deleteTimetable', { key });
  }
}
