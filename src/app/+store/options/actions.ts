/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';

export const updateTileServerUrl = createAction('[Tile Server Url] Update', props<{ tileServer: string }>());

export const updateOsrmServerUrl = createAction('[OSRM Server Url] Update', props<{ osrmServer: string }>());

export const updateEvaluationCap = createAction('[Evaluation Cap] Update', props<{ cap: number }>());
