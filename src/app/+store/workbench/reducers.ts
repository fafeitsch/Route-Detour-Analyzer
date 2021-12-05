/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { importLines } from './actions';

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
  durationToNext: number;
}

export interface Stop extends LatLng {
  name: string;
  realStop: boolean;
}

export interface Line {
  name: string;
  stops: Stop[];
  color: string;
  path?: QueriedPath;
}

export interface Workbench {
  lines: Line[];
}

const initialState: Workbench = { lines: [] };

export const WorkbenchReducer = createReducer(
  initialState,
  on(importLines, (state, { lines }) => {
    return { ...state, lines };
  })
);
