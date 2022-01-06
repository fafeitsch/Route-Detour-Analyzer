/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';
import { Domain, Workbench } from './reducers';
import Line = Domain.Line;

export const linesImported = createAction('[Effects] Import Lines', props<{ workbench: Workbench }>());
export const importSampleLines = createAction('[App Initialization] Import Lines', props<{ workbench: Workbench }>());
export const downloadSample = createAction('[App Initialization] Download Sample');
export const lineSavedInRouteEditor = createAction(
  '[Route Editor] Change Line',
  props<{ oldName: string; line: Line }>()
);
export const lineDeleted = createAction('[Line Panel] Delete Line', props<{ name: string }>());
export const lineCreated = createAction('[Line Panel] Create Line');
