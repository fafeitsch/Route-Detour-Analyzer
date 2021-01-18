import {createReducer, on} from '@ngrx/store';
import {updateOsrmServerUrl, updateTileServerUrl} from '../+actions/actions';
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
