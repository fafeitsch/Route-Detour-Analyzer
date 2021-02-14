/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { map, switchMap, take } from 'rxjs/operators';
import * as polyline from '@mapbox/polyline';
import { QueriedPath } from './+store/paths/types';
import { Options, osrmSelector } from './+store/options';
import { LatLng, Stop } from './+store/types';
import { Route, RouteResults } from 'osrm';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  constructor(private readonly http: HttpClient, private readonly store: Store<{ options: Options }>) {}

  queryOsrmRoute(stops: LatLng[]): Observable<QueriedPath> {
    if (!stops || stops.length < 2) {
      return of({ waypoints: [], distanceTable: [] });
    }
    const coords = stops.map<[number, number]>((stop) => [stop.lat, stop.lng]);
    const poly = encodeURIComponent(polyline.encode(coords));
    return this.store.pipe(
      take(1),
      select('options'),
      select(osrmSelector),
      switchMap((url) => this.http.get<RouteResults>(`${url}/route/v1/driving/polyline(${poly})?overview=full`)),
      map((results) => results.routes[0]),
      map<Route, [[number, number][], number[][]]>((route) => [
        polyline.decode(route.geometry),
        this.buildLegsDistanceTable(route),
      ]),
      map<[[number, number][], number[][]], QueriedPath>(([arr, distanceTable]) => ({ waypoints: arr, distanceTable }))
    );
  }

  private buildLegsDistanceTable(route: Route) {
    const result: number[][] = [...route.legs.map((_) => [...route.legs.map((_) => 0), 0]), [0]];
    for (let i = 0; i < route.legs.length; i++) {
      let currentDistance = 0;
      for (let j = i; j < route.legs.length; j++) {
        result[i][j] = currentDistance;
        currentDistance = currentDistance + route.legs[j].distance;
      }
      result[i][route.legs.length] = currentDistance;
    }
    return result;
  }

  queryNearestStreet(stop: Stop): Observable<Stop> {
    return this.store.pipe(
      select('options'),
      select(osrmSelector),
      switchMap((url) => this.http.get(`${url}/nearest/v1/driving/${stop.lng},${stop.lat}.json?number=1`)),
      map<any, any>((result) => result.waypoints[0]),
      map<any, Stop>((waypoint) => ({
        ...stop,
        name: waypoint.name,
        lat: waypoint.location[1],
        lng: waypoint.location[0],
      }))
    );
  }
}
