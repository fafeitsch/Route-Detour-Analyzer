/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { importSampleLines, lineDeleted, lineSavedInRouteEditor, linesImported } from './actions';

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
  path: QueriedPath;
}

export interface Workbench {
  lines: Line[];
}

const initialState: Workbench = { lines: [] };

export const WorkbenchReducer = createReducer(
  initialState,
  on(linesImported, (state, { lines, replace }) => {
    if (replace) {
      return { ...state, lines };
    }
    const indices: { [name: string]: number } = state.lines.reduce((acc, curr, index) => {
      acc[curr.name] = index;
      return acc;
    }, {} as { [name: string]: number });
    const mergedLines = [...state.lines];
    lines.forEach(line => {
      if (!indices[line.name] === undefined) {
        mergedLines.push(line);
      } else {
        mergedLines[indices[line.name]] = line;
      }
    });
    return { ...state, lines: mergedLines };
  }),
  on(importSampleLines, (state, { lines }) => {
    return { ...state, lines };
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
