/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Workbench } from './reducers';

const featureSelector = createFeatureSelector<Workbench>('workbench');

export const lines = createSelector(featureSelector, workbench => workbench.lines);
