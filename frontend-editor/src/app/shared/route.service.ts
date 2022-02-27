/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RpcClientService } from './rpc-client.service';
import { LatLng, Waypoint } from './types';

export interface Leg {
  distances: number[];
}

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  constructor(private readonly rpc: RpcClientService) {}

  queryOsrmRoute(stops: LatLng[]): Observable<Waypoint[]> {
    if (!stops || stops.length < 2) {
      return of([]);
    }
    return this.rpc.request<Waypoint[]>(
      'osrm',
      'queryRoute',
      stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))
    );
  }

  public buildRouteLegs(
    path: Waypoint[]
  ): { distance: number; duration: number }[] {
    let duration = 0;
    let distance = 0;
    const result: { distance: number; duration: number }[] = [];
    path.forEach((wp, index) => {
      if (index === 0) {
        return;
      }
      if (wp.stop) {
        result.push({ duration, distance });
        duration = 0;
        distance = 0;
      }
      duration = duration + wp.dur;
      distance = distance + wp.dist;
    });
    // the last way point must be a stop, if not a bug happened somewhere else
    if (distance || duration) {
      console.error(
        "The path is erroneous because it doesn't end with a stop (or a waypoint). " +
          'Such lines should not exist. The built route legs might lead to strange results',
        path
      );
    }
    return result;
  }

  queryNearestStreet(stop: LatLng): Observable<string> {
    return this.rpc
      .request<{ name: string }>('osrm', 'queryAddress', {
        lat: stop.lat,
        lng: stop.lng,
      })
      .pipe(map((response) => response.name));
  }
}
