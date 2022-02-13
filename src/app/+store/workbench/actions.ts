/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';
import { DataModel, Domain, Station, Workbench } from './reducers';
import Line = Domain.Line;

export const linesImported = createAction('[Effects] Import Lines', props<{ workbench: Workbench }>());
export const importSampleLines = createAction('[App Initialization] Import Lines', props<{ workbench: Workbench }>());
export const downloadSample = createAction('[App Initialization] Download Sample');
export const lineSavedInRouteEditor = createAction(
  '[Route Editor] Change Line',
  props<{ oldName: string; line: Line }>()
);
export const lineSavedInTimetableEditor = createAction(
  '[Timetable Editor] Change Line',
  props<{ oldName: string; line: Line }>()
);

export const stationManagerChange = createAction(
  '[Station Manager] Commit',
  props<{ dirtyLines: { [name: string]: boolean }; lines: DataModel.Line[]; stations: Station[] }>()
);
export const persistStationManagerChange = createAction(
  '[Effects] Persist Station Manager Commit',
  props<{ lines: DataModel.Line[]; stations: Station[] }>()
);
export const lineDeleted = createAction('[Line Panel] Delete Line', props<{ name: string }>());
export const lineCreated = createAction('[Line Panel] Create Line');
