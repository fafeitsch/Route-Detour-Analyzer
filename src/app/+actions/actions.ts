/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */

import {createAction, props} from '@ngrx/store';
import {Stop} from '../+reducers';

export const updateTileServerUrl = createAction('[Tile Server Url] Update',  props<{url: string}>());

export const updateOsrmServerUrl = createAction('[OSRM Server Url] Update', props<{url: string}>());

export const addUnamedStopToLine = createAction('[Line] Add Unnamed Stop', props<{stop: Stop}>());
export const addStopToLine = createAction('[Line] Add Stop', props<{stop: Stop}>());
export const removeStop = createAction('[Line] Remove Stop', props<{i: number}>());
export const swapStops = createAction('[Line] Swap Stops', props<{i1: number, i2: number}>());
export const renameStop = createAction('[Line] Rename Stop', props<{i: number, name: string}>());
