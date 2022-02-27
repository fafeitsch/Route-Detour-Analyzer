/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';
import { Domain, Workbench } from './reducers';
import Line = Domain.Line;

export const linesImported = createAction(
  '[Effects] Import Lines',
  props<{ workbench: Workbench }>()
);
export const importSampleLines = createAction(
  '[App Initialization] Import Lines',
  props<{ workbench: Workbench }>()
);
export const downloadSample = createAction(
  '[App Initialization] Download Sample'
);
export const lineSavedInTimetableEditor = createAction(
  '[Timetable Editor] Change Line',
  props<{ oldName: string; line: Line }>()
);
