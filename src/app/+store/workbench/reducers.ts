/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { importSampleLines, lineCreated, lineDeleted, lineSavedInRouteEditor, linesImported } from './actions';

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
  on(linesImported, (state, { lines }) => {
    return { ...state, lines };
  }),
  on(importSampleLines, (state, { lines }) => {
    return { ...state, lines };
  }),
  on(lineSavedInRouteEditor, (state, { oldName, line }) => ({
    ...state,
    lines: state.lines.map(oldLine => (oldLine.name === oldName ? line : oldLine)),
  })),
  on(lineDeleted, (state, { name }) => ({ ...state, lines: state.lines.filter(line => line.name !== name) })),
  on(lineCreated, state => ({
    ...state,
    lines: [
      { name: findFreeLineName(state.lines), color: '#3362da', stops: [], path: { waypoints: [], distanceTable: [] } },
      ...state.lines,
    ],
  }))
);

function findFreeLineName(lines: Line[]) {
  let lineNumber = 1;
  const regex = /^Line \d+$/;
  const names = lines.map(line => line.name).filter(name => regex.test(name));
  while (names.includes(`Line ${lineNumber}`)) {
    lineNumber = lineNumber + 1;
  }
  return `Line ${lineNumber}`;
}
