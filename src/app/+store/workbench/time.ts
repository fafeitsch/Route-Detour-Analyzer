/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
export type TimeString = `${number}:${number}` | `${number}:0${number}`;

export function isTime(time: string): time is TimeString {
  const strings = time.split(':');
  const hours = Number(strings[0]);
  const minutes = Number(strings[1]);
  return strings.length === 2 && !isNaN(hours) && !isNaN(minutes) && hours < 24 && minutes < 60;
}

export function parseTime(time: TimeString) {
  const strings = time.split(':');
  const hours = Number(strings[0]);
  const minutes = Number(strings[1]);
  return { hours, minutes };
}

export function computeTime(time: TimeString) {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

export function addMinutes(time: TimeString, add: number): TimeString {
  const minutes = computeTime(time);
  return formatTime(minutes + add);
}

export function formatTime(time: number): TimeString {
  const hours = Math.floor(time / 60);
  const min = time % 60;
  return min < 10 ? `${hours}:0${min}` : `${hours}:${min}`;
}
