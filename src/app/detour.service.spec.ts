/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { DetourService, SubPath } from './detour.service';
import { Stop } from './route.service';

describe('DetourService#computeDetours', () => {
  it('should return undefined if input is empty', () => {
    const service = new DetourService();
    const result = service.computeDetours([], []);
    expect(result).toBeUndefined();
  });
  it('should compute the correct result', () => {
    const input: SubPath[] = [
      { startIndex: 1, endIndex: 5, path: { waypoints: [], distanceTable: [[0, 10], [0]] } },
      { startIndex: 1, endIndex: 4, path: { waypoints: [], distanceTable: [[0, 8], [0]] } },
      { startIndex: 2, endIndex: 3, path: { waypoints: [], distanceTable: [[0, 5], [0]] } },
      { startIndex: 0, endIndex: 5, path: { waypoints: [], distanceTable: [[0, 18], [0]] } },
    ];
    const originalDistances = [
      [0, 10, 20, 30, 40, 50],
      [0, 0, 10, 20, 30, 40],
      [0, 0, 0, 10, 20, 30],
      [0, 0, 0, 0, 10, 10],
      [0, 0, 0, 0, 0, 10],
      [0, 0, 0, 0, 0, 0],
    ];
    const service = new DetourService();
    const result = service.computeDetours(originalDistances, input);
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

const mockLine: Stop[] = [
  { name: 'Main Station', realStop: true, lng: 0, lat: 0 },
  { name: 'Waypoint', realStop: false, lng: 0, lat: 0 },
  { name: 'Mall', realStop: true, lng: 0, lat: 0 },
  { name: 'Castle', realStop: true, lng: 0, lat: 0 },
  { name: 'Waypoint', realStop: false, lng: 0, lat: 0 },
  { name: 'Court', realStop: true, lng: 0, lat: 0 },
  { name: 'Waypoint', realStop: false, lng: 0, lat: 0 },
  { name: 'Theater', realStop: true, lng: 0, lat: 0 },
];

describe('DetourService#createQueryPairs', () => {
  it('should not crash with index out of bounds', () => {
    const service = new DetourService();
    const queryPairs = service.createQueryPairs(mockLine, -1);
    expect(queryPairs.length).toBeFalsy();
  });

  it('should give only the whole line', () => {
    const service = new DetourService();
    const queryPairs = service.createQueryPairs([...mockLine], 0);
    expect(queryPairs.length).toBe(1);
    expect(queryPairs[0].source.lat).toBe(mockLine[0].lat);
    expect(queryPairs[0].source.lng).toBe(mockLine[0].lng);
    expect(queryPairs[0].target.lat).toBe(mockLine[7].lat);
    expect(queryPairs[0].target.lng).toBe(mockLine[7].lng);
  });

  it('should ignore non-stops', () => {
    const service = new DetourService();
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
