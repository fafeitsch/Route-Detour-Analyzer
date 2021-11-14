/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take } from 'rxjs/operators';
import * as polyline from '@mapbox/polyline';
import { Route, RouteResults } from 'osrm';
import { OptionsStore } from './options-store.service';

export interface Leg {
  distances: number[];
}

export interface QueriedPath {
  waypoints: Waypoint[];
  distanceTable: number[][];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Waypoint extends LatLng {
  stop: boolean;
  distanceToNext: number;
}

export interface Stop extends LatLng {
  name: string;
  realStop: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  constructor(private readonly http: HttpClient, private readonly optionsStore: OptionsStore) {}

  queryOsrmRoute(stops: LatLng[]): Observable<QueriedPath> {
    if (!stops || stops.length < 2) {
      return of({ waypoints: [], distanceTable: [], legs: [] });
    }
    const coords = stops.map<[number, number]>(stop => [stop.lat, stop.lng]);
    const poly = encodeURIComponent(polyline.encode(coords));
    return this.optionsStore.osrmUrl$.pipe(
      take(1),
      switchMap(url =>
        this.http.get<RouteResults>(`${url}/route/v1/driving/polyline(${poly})?overview=full&annotations=true`)
      ),
      map(results => results.routes[0]),
      map<Route, [Route, number[][]]>(route => [route, this.buildLegsDistanceTable(route)]),
      map<[Route, number[][]], QueriedPath>(([arr, distanceTable]) => {
        const waypoints: Waypoint[] = polyline
          .decode(arr.geometry)
          .map(r => ({ lat: r[0], lng: r[1], distanceToNext: 0, stop: false }));
        let rawIndex = 0;
        arr.legs.forEach((leg, legIndex) => {
          waypoints[rawIndex].stop = true;
          leg.annotation.distance.forEach(distance => {
            waypoints[rawIndex].distanceToNext = distance;
            rawIndex = rawIndex + 1;
          });
        });
        waypoints[waypoints.length - 1].stop = true;
        return {
          waypoints,
          distanceTable,
        };
      })
    );
  }

  private buildLegsDistanceTable(route: Route) {
    const result: number[][] = [...route.legs.map(_ => [...route.legs.map(_ => 0), 0]), [0]];
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
    return this.optionsStore.osrmUrl$.pipe(
      take(1),
      switchMap(url => this.http.get(`${url}/nearest/v1/driving/${stop.lng},${stop.lat}.json?number=1`)),
      map<any, any>(result => result.waypoints[0]),
      map<any, Stop>(waypoint => ({
        ...stop,
        name: waypoint.name,
        lat: waypoint.location[1],
        lng: waypoint.location[0],
      }))
    );
  }
}
