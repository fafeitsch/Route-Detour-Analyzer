import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Domain, Workbench } from '../+store/workbench';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SampleService {
  constructor(private readonly http: HttpClient) {}

  fetchSample(): Observable<Workbench> {
    return this.http.get<Workbench>('./assets/wuerzburg.json');
  }
}
