/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { setFocusedStop, unsetFocusedStop } from './actions';
import { Stop } from '../types';

const updateFocusedStopReducer = createReducer(
  undefined,
  on(setFocusedStop, (state: Stop | undefined, { stop }) => ({ ...stop })),
  on(unsetFocusedStop, (state) => undefined)
);

export function focusedStopReducer(state: Stop | undefined, action: any) {
  return updateFocusedStopReducer(state, action);
}
