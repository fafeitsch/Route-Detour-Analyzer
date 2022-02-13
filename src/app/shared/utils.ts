/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
export function uuid() {
  var uuidValue = '',
    k,
    randomValue;
  for (k = 0; k < 32; k++) {
    randomValue = (Math.random() * 16) | 0;

    if (k == 8 || k == 12 || k == 16 || k == 20) {
      uuidValue += '-';
    }
    uuidValue += (k == 12 ? 4 : k == 16 ? (randomValue & 3) | 8 : randomValue).toString(16);
  }
  return uuidValue;
}
