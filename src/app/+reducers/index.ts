import {createReducer, on} from '@ngrx/store';
import {addStopToLine, removeStop, renameStop, swapStops, updateOsrmServerUrl, updateTileServerUrl} from '../+actions/actions';
import {environment} from '../../environments/environment';

export const initialTileServer = environment.tileServerUrl;

const updateTileServerReducer = createReducer(
  initialTileServer,
  on(updateTileServerUrl, (state, {url}) => url),
);

export function tileServerReducer(state: string | undefined, action: any): string {
  return updateTileServerReducer(state, action);
}

export const initialOsrmServer = environment.osrmServerUrl;

const updateOsrmTileServerReducer = createReducer(
  initialOsrmServer,
  on(updateOsrmServerUrl, (state, {url}) => url),
)

export function osrmServerReducer(state: string | undefined, action: any): string{
  return updateOsrmTileServerReducer(state, action);
}

export interface LatLng {
  lat: number,
  lng: number
}

export interface Stop {
  name: string,
  lat: number,
  lng: number,
}

const initialLine: Stop[] = [];

const updateLineReducer = createReducer(
  initialLine,
  on(addStopToLine, (state: Stop[], {stop}) => [...state, stop]),
  on(removeStop, (state, {i} ) => {
    const newState = [...state];
    newState.splice(i,1 );
    return newState;
  }),
  on(swapStops, (state: Stop[], {i1,i2}) => {
    const newState = [...state];
    newState[i1] = state[i2];
    newState[i2] = state[i1];
    return newState;
  }),
  on(renameStop, (state: Stop[], {i, name}) => {
    const newState = [...state];
    newState[i] = {...state[i], name};
    return newState;
  })
)

export function lineReducer(state: Stop[] | undefined, action: any){
  return updateLineReducer(state, action);
}


