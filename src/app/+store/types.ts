/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Stop extends LatLng {
  name: string;
  realStop: boolean;
}
