/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createAction, props } from '@ngrx/store';
import { Line } from './reducers';

export const importLines = createAction('[Import Panel] Import Lines', props<{ lines: Line[] }>());
export const importSampleLines = createAction('[App Initialization] Import Lines', props<{ lines: Line[] }>());
export const downloadSample = createAction('[App Initialization] Download Sample');
