/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */

import { createAction, props } from '@ngrx/store';
import { Stop } from '../+reducers/reducers';

export const updateTileServerUrl = createAction('[Tile Server Url] Update', props<{ url: string }>());

export const updateOsrmServerUrl = createAction('[OSRM Server Url] Update', props<{ url: string }>());

export const addRawStopToLine = createAction('[Line] Add Unnamed Stop', props<{ stop: Stop }>());
export const addStopToLine = createAction('[Line] Add Stop', props<{ stop: Stop }>());
export const removeStop = createAction('[Line] Remove Stop', props<{ i: number }>());
export const moveStop = createAction('[Line] Swap Stops', props<{ oldIndex: number; newIndex: number }>());
export const renameStop = createAction('[Line] Rename Stop', props<{ i: number; name: string }>());
export const toggleRealStop = createAction('[Line] Toggle Real Stop', props<{ i: number }>());
export const changeStopLatLng = createAction(
  '[Line] Change Stop LatLng',
  props<{ i: number; lat: number; lng: number }>()
);

export const setFocusedStop = createAction('[Focus] Set Stop', props<{ stop: Stop }>());
export const unsetFocusedStop = createAction('[Focus] Unset Stop');
