/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import {
  addStopToLine,
  removeStop,
  renameStop,
  moveStop,
  updateOsrmServerUrl,
  updateTileServerUrl,
  toggleRealStop,
  changeStopLatLng,
  setFocusedStop,
  unsetFocusedStop,
} from '../+actions/actions';
import { environment } from '../../environments/environment';

export const initialTileServer = environment.tileServerUrl;

const updateTileServerReducer = createReducer(
  initialTileServer,
  on(updateTileServerUrl, (state, { url }) => url)
);

export function tileServerReducer(state: string | undefined, action: any): string {
  return updateTileServerReducer(state, action);
}

export const initialOsrmServer = environment.osrmServerUrl;

const updateOsrmTileServerReducer = createReducer(
  initialOsrmServer,
  on(updateOsrmServerUrl, (state, { url }) => url)
);

export function osrmServerReducer(state: string | undefined, action: any): string {
  return updateOsrmTileServerReducer(state, action);
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Stop extends LatLng {
  name: string;
  realStop: boolean;
}

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

const updateFocusedStopReducer = createReducer(
  undefined,
  on(setFocusedStop, (state: Stop | undefined, { stop }) => ({ ...stop })),
  on(unsetFocusedStop, (state) => undefined)
);

export function focusedStopReducer(state: Stop | undefined, action: any) {
  return updateFocusedStopReducer(state, action);
}
