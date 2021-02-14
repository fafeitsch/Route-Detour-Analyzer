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
