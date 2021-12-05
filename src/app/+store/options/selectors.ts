/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OptionsState } from './reducers';

export const getOptionsState = createFeatureSelector<OptionsState>('options');

export const selectTileServer = createSelector(getOptionsState, (state: OptionsState) => state.tileServer);
export const selectOsrmServer = createSelector(getOptionsState, (state: OptionsState) => state.osrm);
export const selectMapCenter = createSelector(getOptionsState, (state: OptionsState) => state.mapCenter);
