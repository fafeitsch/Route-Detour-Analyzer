import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {LatLng, Stop} from './+reducers';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {catchError, map, switchMap} from 'rxjs/operators';
import * as polyline from '@mapbox/polyline';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  constructor(private readonly http: HttpClient, private store: Store<{osrmServer: string}>) {}

  queryOsrmRoute(stops: Stop[]):Observable<LatLng[]>{
    if(!stops || stops.length < 2){
      return of([]);
    }
    const coords = stops.map<[number, number]>(stop => [stop.lat, stop.lng]);
    const poly = polyline.encode(coords);
      return this.store.select('osrmServer').pipe(
        switchMap(url => this.http.get(`${url}/route/v1/driving/polyline(${poly})?overview=full`)),
        map<any, string>(result => result.routes[0].geometry),
        map<string, [number, number][]>(geometries => polyline.decode(geometries)),
        map<[number, number][], LatLng[]>(arr => arr.map(tuple => ({lat: tuple[0], lng: tuple[1]}))),
      )
    }

  queryOsrmName(stop: Stop):Observable<string>{
    return this.store.select('osrmServer').pipe(
      switchMap(url => this.http.get(`${url}/nearest/v1/driving/${stop.lng},${stop.lat}.json?number=1`)),
      map<any, any>(result => result.waypoints[0]),
      map<any, string>(waypoint => waypoint.name),
      map(name => name || stop.name)
    )
  }
}
