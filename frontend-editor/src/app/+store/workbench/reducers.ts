/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { linesImported } from './actions';
import { TimeString } from './time';

export namespace DataModel {
  export interface Line {
    name: string;
    color: string;
    timetable: Timetable;
    stops: Stop[];
    path: QueriedPath;
  }

  export type Stop = { key: string };
}

export namespace Domain {
  export interface Line {
    name: string;
    color: string;
    timetable: Timetable;
    stops: Station[];
    path: QueriedPath;
  }
}

export interface QueriedPath {
  waypoints: Waypoint[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Waypoint extends LatLng {
  stop?: boolean;
  dist: number;
  dur: number;
}

export interface Station extends LatLng {
  name: string;
  key: string;
  isWaypoint?: boolean;
}

export interface Workbench {
  stations: Station[];
  lines: DataModel.Line[];
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

const initialState: Workbench = { lines: [], stations: [] };

export const workbenchReducer = createReducer(
  initialState,
  on(linesImported, (state, { workbench }) => ({
    ...state,
    ...workbench,
  }))
);
