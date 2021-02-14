/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Paths } from './types';

export const getPathsState = createFeatureSelector<Paths>('paths');

export const getOriginalPath = createSelector(getPathsState, (state) => state.originalPath);

export const getSubPaths = createSelector(getPathsState, (state) => state.subPaths);
