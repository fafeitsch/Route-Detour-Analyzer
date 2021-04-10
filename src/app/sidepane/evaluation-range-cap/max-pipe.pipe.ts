/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maxPipe',
})
export class MaxPipePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const num = Number(value);
    return !num || num < 2 ? 2 : num;
  }
}
