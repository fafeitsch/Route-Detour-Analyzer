/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { uuid } from './utils';
import { Observable, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Request {
  jsonrpc: string;
  method: string;
  params: any;
  id: string;
}

export interface Response {
  jsonrpc: string;
  result?: string;
  error?: string;
  id: string;
}

export interface Error {
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class RpcClientService {
  constructor(private readonly http: HttpClient) {}

  request<T>(topic: string, method: string, params?: any): Observable<T> {
    const request: Request = {
      jsonrpc: '2.0',
      id: uuid(),
      method,
      params,
    };
    return this.http
      .post<Response>(`${environment.backend}/rpc/${topic}`, request)
      .pipe(
        filter((response) => response.id === request.id),
        catchError(() =>
          of({
            error: 'HTTP request failed. Check logs.',
            result: undefined,
          })
        ),
        map((response) => {
          if (response.result) {
            return response.result as any;
          }
          if (response.error) {
            throw new Error(response.error);
          }
        })
      );
  }
}
