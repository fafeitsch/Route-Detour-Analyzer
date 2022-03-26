/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';
import { Workbench } from './reducers';

export const linesImported = createAction(
  '[Effects] Import Lines',
  props<{ workbench: Workbench }>()
);
