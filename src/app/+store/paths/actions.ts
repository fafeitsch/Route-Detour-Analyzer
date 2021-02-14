/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';
import { QueriedPath, SubPath } from './types';

export const setPaths = createAction('[PATHS] Set Original Path', props<{ originalPath: QueriedPath }>());

export const resetSubPaths = createAction('[PATH] Reset Sub Paths');

export const addSubPath = createAction('[PATH] Add Sub Path', props<{ path: SubPath }>());
