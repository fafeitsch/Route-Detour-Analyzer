/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Observable, OperatorFunction, pipe, UnaryFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function uuid() {
  let uuidValue = '';
  let k;
  let randomValue;
  for (k = 0; k < 32; k++) {
    // eslint-disable-next-line no-bitwise
    randomValue = (Math.random() * 16) | 0;

    if (k === 8 || k === 12 || k === 16 || k === 20) {
      uuidValue += '-';
    }
    uuidValue += // eslint-disable-next-line no-bitwise
    (k === 12 ? 4 : k === 16 ? (randomValue & 3) | 8 : randomValue).toString(
      16
    );
  }
  return uuidValue;
}

export function isDefined<T>(): UnaryFunction<
  Observable<T | null | undefined>,
  Observable<T>
> {
  return pipe(
    filter((x) => x != null) as OperatorFunction<T | null | undefined, T>
  );
}
