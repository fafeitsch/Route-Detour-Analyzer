/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { Paths } from './types';
import { addSubPath, resetSubPaths, setPaths } from './actions';

const initialState: Paths = {
  subPaths: [],
  minSubPathCount: undefined,
  originalPath: { distanceTable: [], waypoints: [] },
};

const reducer = createReducer(
  initialState,
  on(setPaths, (state, { originalPath }) => ({ ...state, originalPath })),
  on(resetSubPaths, (state) => ({ ...state, subPaths: [] })),
  on(addSubPath, (state, { path }) => ({ ...state, subPaths: [...state.subPaths, path] }))
);

export function statisticsReducer(state: Paths | undefined, action: any): Paths {
  return reducer(state, action);
}
