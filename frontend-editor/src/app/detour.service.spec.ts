/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {DetourService, SubPath} from './detour.service';
import {RouteService} from './route.service';
import {TestBed} from '@angular/core/testing';
import {Station} from './+store/workbench';

describe('DetourService#computeDetours', () => {
  let service: DetourService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RouteService] });
  });

  it('should return undefined if input is empty', () => {
    const result = service.computeDetours({ waypoints: [] }, []);
    expect(result).toBeUndefined();
  });
  it('should compute the correct result', () => {
    const input: SubPath[] = [
      {
        startIndex: 1,
        endIndex: 5,
        path: {
          waypoints: [
            { stop: true, dur: 10, dist: 10, lat: 0, lng: 0 },
            { stop: true, dur: 0, dist: 0, lat: 0, lng: 0 },
          ],
        },
      },
      {
        startIndex: 1,
        endIndex: 4,
        path: {
          waypoints: [
            { stop: true, dur: 8, dist: 8, lat: 0, lng: 0 },
            { stop: true, dur: 0, dist: 0, lat: 0, lng: 0 },
          ],
        },
      },
      {
        startIndex: 2,
        endIndex: 3,
        path: {
          waypoints: [
            { stop: true, dur: 5, dist: 5, lat: 0, lng: 0 },
            { stop: true, dur: 0, dist: 0, lat: 0, lng: 0 },
          ],
        },
      },
      {
        startIndex: 0,
        endIndex: 5,
        path: {
          waypoints: [
            { stop: true, dur: 18, dist: 18, lat: 0, lng: 0 },
            { stop: true, dur: 0, dist: 0, lat: 0, lng: 0 },
          ],
        },
      },
    ];
    const path = {
      waypoints: new Array(6)
        .map((_, i) => (i + 1) * 10)
        .map(dist => ({ stop: true, dist, dur: dist, lat: 0, lng: 0 })),
    };
    path.waypoints[path.waypoints.length - 1].dist = 0;
    path.waypoints[path.waypoints.length - 1].dur = 0;
    const result = service.computeDetours(path, input);
    expect(result).toBeDefined();
    expect(result!.averageDetour).toBeCloseTo(3.13, 0.001);
    expect(result!.smallestDetour!.absolute).toBe(5);
    expect(result!.smallestDetour!.relative).toBe(2);
    expect(result!.smallestDetour!.source).toBe(2);
    expect(result!.smallestDetour!.target).toBe(3);
    expect(result!.biggestDetour!.absolute).toBe(30);
    expect(result!.biggestDetour!.relative).toBe(4);
    expect(result!.biggestDetour!.source).toBe(1);
    expect(result!.biggestDetour!.target).toBe(5);
    expect(result!.medianDetour!.absolute).toBe(32);
    expect(result!.medianDetour!.relative).toBeCloseTo(2.77, 0.01);
    expect(result!.medianDetour!.source).toBe(0);
    expect(result!.medianDetour!.target).toBe(5);
  });
});

const mockLine: Station[] = [
  { name: 'Main Station' },
  { name: 'Waypoint', isWaypoint: true },
  { name: 'Mall' },
  { name: 'Castle' },
  { name: 'Waypoint', isWaypoint: true },
  { name: 'Court' },
  { name: 'Waypoint', isWaypoint: true },
  { name: 'Theater' },
].map(station => ({ ...station, key: station.name, lat: 0, lng: 0 }));

describe('DetourService#createQueryPairs', () => {
  let service: DetourService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RouteService] });
  });

  it('should not crash with index out of bounds', () => {
    const queryPairs = service.createQueryPairs(mockLine, -1);
    expect(queryPairs.length).toBeFalsy();
  });

  it('should give only the whole line', () => {
    const queryPairs = service.createQueryPairs([...mockLine], 0);
    expect(queryPairs.length).toBe(1);
    expect(queryPairs[0].source.lat).toBe(mockLine[0].lat);
    expect(queryPairs[0].source.lng).toBe(mockLine[0].lng);
    expect(queryPairs[0].target.lat).toBe(mockLine[7].lat);
    expect(queryPairs[0].target.lng).toBe(mockLine[7].lng);
  });

  it('should ignore non-stops', () => {
    const queryPairs = service.createQueryPairs([...mockLine], 3);
    expect(queryPairs.length).toBe(10);
    expect(queryPairs[4].source.lat).toBe(mockLine[2].lat);
    expect(queryPairs[4].source.lng).toBe(mockLine[2].lng);
    expect(queryPairs[4].source.index).toBe(2);
    expect(queryPairs[4].target.lat).toBe(mockLine[3].lat);
    expect(queryPairs[4].target.lng).toBe(mockLine[3].lng);
    expect(queryPairs[4].target.index).toBe(3);
  });
});
