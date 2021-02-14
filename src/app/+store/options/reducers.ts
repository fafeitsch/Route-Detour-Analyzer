/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { environment } from '../../../environments/environment';
import { createReducer, on } from '@ngrx/store';
import { updateEvaluationCap, updateOsrmServerUrl, updateTileServerUrl } from './actions';

export interface Options {
  tileServer: string;
  osrmServer: string;
  evaluationRangeCap: number;
}

const initialState = {
  tileServer: environment.tileServerUrl,
  osrmServer: environment.osrmServerUrl,
  evaluationRangeCap: 0,
};

const reducer = createReducer(
  initialState,
  on(updateTileServerUrl, (state, { tileServer }) => ({ ...state, tileServer })),
  on(updateOsrmServerUrl, (state, { osrmServer }) => ({ ...state, osrmServer })),
  on(updateEvaluationCap, (state, { cap }) => ({ ...state, evaluationRangeCap: cap }))
);

export function optionsReducer(state: Options | undefined, action: any): Options {
  return reducer(state, action);
}
