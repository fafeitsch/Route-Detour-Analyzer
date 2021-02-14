/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import { Stop } from '../types';
import { addStopToLine, removeStop, moveStop, renameStop, toggleRealStop, changeStopLatLng } from './actions';

const initialLine: Stop[] = [];

const updateLineReducer = createReducer(
  initialLine,
  on(addStopToLine, (state: Stop[], { stop }) => [...state, stop]),
  on(removeStop, (state, { i }) => {
    const newState = [...state];
    newState.splice(i, 1);
    return newState;
  }),
  on(moveStop, (state: Stop[], { oldIndex, newIndex }) => {
    const newState = [...state];
    const taken = newState.splice(oldIndex, 1);
    newState.splice(newIndex, 0, taken[0]);
    return newState;
  }),
  on(renameStop, (state: Stop[], { i, name }) => {
    const newState = [...state];
    newState[i] = { ...state[i], name };
    return newState;
  }),
  on(toggleRealStop, (state: Stop[], { i }) => {
    const newState = [...state];
    newState[i] = { ...state[i], realStop: !state[i].realStop };
    return newState;
  }),
  on(changeStopLatLng, (state: Stop[], { i, lat, lng }) => {
    const newState = [...state];
    newState[i] = { ...state[i], lat, lng };
    return newState;
  })
);

export function lineReducer(state: Stop[] | undefined, action: any) {
  return updateLineReducer(state, action);
}
