/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import {
  importSampleLines,
  lineDeleted,
  lineSavedInRouteEditor,
  linesImported,
  persistStationManagerChange,
} from './actions';

export namespace DataModel {
  export interface Line {
    name: string;
    color: string;
    timetable: Tour[];
    stops: Stop[];
    path: QueriedPath;
  }

  export type Stop = { key: string };
}

export namespace Domain {
  export interface Line {
    name: string;
    color: string;
    timetable: Tour[];
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

export interface Tour {
  stops: ArrivalDeparture[];
}

export interface ArrivalDeparture {
  arrival: number;
  departure: number;
}

const initialState: Workbench = { lines: [], stations: [] };

export const WorkbenchReducer = createReducer(
  initialState,
  on(linesImported, importSampleLines, (state, { workbench }) => {
    return { ...state, ...workbench };
  }),
  on(lineSavedInRouteEditor, (state, { oldName, line }) => {
    oldName = oldName || line.name;
    return {
      ...state,
      lines: state.lines.some(l => l.name === oldName)
        ? state.lines.map(oldLine => (oldLine.name === oldName ? line : oldLine))
        : [...state.lines, line],
    };
  }),
  on(lineDeleted, (state, { name }) => ({
    ...state,
    lines: state.lines.filter(line => line.name !== name),
  })),
  on(persistStationManagerChange, (state, { lines, stations }) => ({
    ...state,
    lines,
    stations,
  }))
);
