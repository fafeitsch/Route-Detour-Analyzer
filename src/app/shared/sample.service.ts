import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Line } from '../+store/workbench';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SampleService {
  constructor(private readonly http: HttpClient) {}

  fetchSample(): Observable<Line[]> {
    return this.http.get<Line[]>('./assets/wuerzburg.json');
  }
}
