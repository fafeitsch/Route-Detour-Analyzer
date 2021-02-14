/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Options } from './reducers';
import { createSelector } from '@ngrx/store';

export * from './actions';
export * from './options-state.module';
export { Options } from './reducers';

const selectOsrmUrl = (state: Options) => state.osrmServer;
const selectTileServerUrl = (state: Options) => state.tileServer;

export const osrmSelector = createSelector(selectOsrmUrl, (url) => url);
export const tileServerSelector = createSelector(selectTileServerUrl, (url) => url);
