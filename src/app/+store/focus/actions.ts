/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */

import { createAction, props } from '@ngrx/store';
import { Stop } from '../types';

export const setFocusedStop = createAction('[Focus] Set Stop', props<{ stop: Stop }>());
export const unsetFocusedStop = createAction('[Focus] Unset Stop');
