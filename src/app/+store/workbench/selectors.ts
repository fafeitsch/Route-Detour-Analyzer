/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Line, Workbench } from './reducers';

const featureSelector = createFeatureSelector<Workbench>('workbench');

export const lines = createSelector(featureSelector, workbench => workbench.lines);
export const freeLineName = createSelector(featureSelector, workbench => findFreeLineName(workbench.lines));

function findFreeLineName(lines: Line[]) {
  let lineNumber = 1;
  const regex = /^Line \d+$/;
  const names = lines.map(line => line.name).filter(name => regex.test(name));
  while (names.includes(`Line ${lineNumber}`)) {
    lineNumber = lineNumber + 1;
  }
  return `Line ${lineNumber}`;
}
