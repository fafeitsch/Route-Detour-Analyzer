/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {createAction, props} from '@ngrx/store';

export const setTileServerFromOptionsPanel = createAction(
  '[Options Panel] Set Tile Server',
  props<{ tileServer: string }>()
);

export const setMapCenterFromOptionsPanel = createAction(
  '[Options Panel] Set Map Center',
  props<{ lat: number; lng: number; zoom: number }>()
);
