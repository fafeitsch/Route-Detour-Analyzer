/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { createFeatureSelector, createSelector, Selector } from '@ngrx/store';
import { DataModel, Domain, Station, Workbench } from './reducers';

const featureSelector = createFeatureSelector<Workbench>('workbench');

export const workbenchForExport = createSelector(featureSelector, workbench => workbench);

export const lines: Selector<Workbench, Domain.Line[]> = createSelector(featureSelector, workbench => {
  const stationMap = workbench.stations.reduce((acc, curr) => {
    acc[curr.key] = curr;
    return acc;
  }, {} as { [key: string]: Station });
  return workbench.lines.map(line => ({
    ...line,
    stops: line.stops.map(stop => {
      if (DataModel.isStationReference(stop)) {
        return { ...stationMap[stop.key], realStop: true };
      }
      return { ...stop, realStop: false };
    }),
  }));
});
export const freeLineName = createSelector(featureSelector, workbench => findFreeLineName(workbench.lines));

function findFreeLineName(lines: DataModel.Line[]) {
  let lineNumber = 1;
  const regex = /^Line \d+$/;
  const names = lines.map(line => line.name).filter(name => regex.test(name));
  while (names.includes(`Line ${lineNumber}`)) {
    lineNumber = lineNumber + 1;
  }
  return `Line ${lineNumber}`;
}
