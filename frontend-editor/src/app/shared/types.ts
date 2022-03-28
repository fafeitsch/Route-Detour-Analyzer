/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { TimeString } from '../+store/workbench';

export interface Line {
  name: string;
  color: string;
  timetable: Timetable;
  key: string;
  stops: string[];
  stations: Station[];
  path: Waypoint[];
}

export interface LineIdentifier {
  key: string;
  name: string;
}

export interface Station {
  name: string;
  key: string;
  lat: number;
  lng: number;
  isWaypoint?: boolean;
  lines: LineIdentifier[];
}

export interface Waypoint {
  lat: number;
  lng: number;
  dist: number;
  dur: number;
  stop?: boolean;
}

export interface Timetable {
  tours: Tour[];
}

export interface Tour {
  events: ArrivalDeparture[];
  intervalMinutes?: number;
  lastTour?: TimeString;
}

export interface ArrivalDeparture {
  arrival?: TimeString;
  departure?: TimeString;
}

export interface Dashboard {
  lines: Line[];
  stations: Station[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface StationUpdate {
  changedOrAdded: Station[];
  deleted: string[];
}

export interface StationDelete {
  key: string;
}