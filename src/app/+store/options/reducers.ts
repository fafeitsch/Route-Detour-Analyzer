/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createReducer, on } from '@ngrx/store';
import * as action from './actions';

export interface OptionsState {
  tileServer: string;
  osrm: string;
  mapCenter: { lat: number; lng: number; zoom: number };
}

export const initialState: OptionsState = {
  tileServer: localStorage.getItem('tileServer') || '',
  osrm: localStorage.getItem('osrm') || '',
  mapCenter: JSON.parse(localStorage.getItem('mapCenter') as any) || {
    lat: 49.789,
    lng: 9.9254,
    zoom: 14,
  },
};

export const TileServerReducer = createReducer(
  initialState,
  on(action.setTileServerFromOptionsPanel, (state, { tileServer }) => {
    localStorage.setItem('tileServer', tileServer);
    return { ...state, tileServer };
  }),
  on(action.setOsrmServerFromOptionsPanel, (state, { osrm }) => {
    localStorage.setItem('osrm', osrm);
    return { ...state, osrm };
  }),
  on(action.setMapCenterFromOptionsPanel, (state, mapCenter) => {
    localStorage.setItem('mapCenter', JSON.stringify(mapCenter));
    return { ...state, mapCenter };
  })
);
