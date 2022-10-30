/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { TimeString } from './time';

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
  lineKey: string;
  name: string;
  key: string;
  tours: Tour[];
  stations: Station[];
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

export interface DetourResult {
  emptyResult: boolean;
  averageDetour: number;
  medianDetour: DetailResult;
  biggestDetour: DetailResult;
  smallestDetour: DetailResult;
}

export interface DetailResult {
  absolute: number;
  relative: number;
  source: number;
  target: number;
}

export interface Vehicle {
  name: string;
  key: string;
  position: LatLng;
  tasks: Task[];
}

export interface Task {
  start: TimeString;
  type: 'roaming' | 'line';
  // Free roaming properties
  path?: Waypoint[];
  // Line/Timetable properties
  timetableKey?: string;
  pathIndex?: number;
}

export interface Center {
  lat: number;
  lng: number;
  zoom: number;
}
