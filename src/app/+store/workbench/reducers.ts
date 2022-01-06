/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { importSampleLines, lineDeleted, lineSavedInRouteEditor, linesImported } from './actions';

export namespace DataModel {
  export interface Line {
    name: string;
    color: string;
    stops: Stop[];
    path: QueriedPath;
  }

  export type Stop = LatLng | { key: string };

  export function isStationReference(stop: Stop): stop is { key: string } {
    return (stop as { key: string }).key !== undefined;
  }
}

export namespace Domain {
  export interface Line {
    name: string;
    color: string;
    stops: Stop[];
    path: QueriedPath;
  }

  export type Stop = Partial<Station> & LatLng & { realStop: boolean };
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
  stop?: boolean;
  distance: number;
  duration: number;
}

export interface Station extends LatLng {
  name: string;
  key: string;
}

export interface Workbench {
  stations: Station[];
  lines: DataModel.Line[];
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
  }))
);
