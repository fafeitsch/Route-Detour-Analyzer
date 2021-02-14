/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
export interface Paths {
  minSubPathCount: number | undefined;
  originalPath: QueriedPath;
  subPaths: SubPath[];
}

export interface SubPath {
  startIndex: number;
  endIndex: number;
  path: QueriedPath;
}

export interface QueriedPath {
  waypoints: [number, number][];
  distanceTable: number[][];
}
