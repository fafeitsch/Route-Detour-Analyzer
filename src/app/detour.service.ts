/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { DataModel, QueriedPath, Station } from './+store/workbench';

export interface DetourResult {
  averageDetour: number;
  medianDetour?: DetailResult;
  biggestDetour?: DetailResult;
  smallestDetour?: DetailResult;
}

export interface DetailResult {
  absolute: number;
  relative: number;
  source: number;
  target: number;
}

export interface QueryPair {
  source: { index: number } & Station;
  target: { index: number } & Station;
}

export interface SubPath {
  startIndex: number;
  endIndex: number;
  path: QueriedPath;
}

@Injectable({ providedIn: 'root' })
export class DetourService {
  computeDetours(originalDistances: number[][], paths: SubPath[]): DetourResult {
    if (!paths.length) {
      return { averageDetour: 0 };
    }
    const mapToLength = (sub: SubPath) => sub.path.distTable[0][1];
    const detailedResults = paths
      .map(p => ({
        absolute: originalDistances[p.startIndex][p.endIndex] - mapToLength(p),
        relative: originalDistances[p.startIndex][p.endIndex] / mapToLength(p),
        source: p.startIndex,
        target: p.endIndex,
      }))
      .sort((a, b) => a.relative - b.relative);
    const averageDetour =
      detailedResults.map(result => result.relative).reduce((acc, curr) => acc + curr, 0) / detailedResults.length;
    return {
      averageDetour,
      medianDetour: detailedResults[Math.floor(detailedResults.length / 2)],
      biggestDetour: detailedResults[detailedResults.length - 1],
      smallestDetour: detailedResults[0],
    };
  }

  createQueryPairs(line: Station[], cap: number): QueryPair[] {
    const numbersOfStops = line.filter(s => !s.isWaypoint).length;
    const gap = numbersOfStops - cap;
    const result: QueryPair[] = [];
    line.forEach((stop, index) => {
      if (stop.isWaypoint) {
        return;
      }
      let counter = 1;
      line.slice(index + 1).forEach((target, targetIndex) => {
        counter = !target.isWaypoint ? counter + 1 : counter;
        if (target.isWaypoint || counter < gap) {
          return;
        }
        result.push({ source: { ...stop, index }, target: { ...target, index: targetIndex + index + 1 } });
      });
    });
    return result;
  }
}
