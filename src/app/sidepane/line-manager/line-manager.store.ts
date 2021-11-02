/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { LineStore } from '../../line.store';
import { map, skipWhile, switchMap, take, tap } from 'rxjs/operators';
import { from, Observable } from 'rxjs';

@Injectable()
export class LineManagerStore extends ComponentStore<{}> {
  readonly getLines$ = this.lineStore.lines$.pipe(
    map(lines => lines.sort((l1, l2) => l1.name.localeCompare(l2.name, undefined, { numeric: true })))
  );

  readonly getSelectedLine$ = this.lineStore.selectedLine$;
  readonly renameLine$ = this.lineStore.renameLine$;
  readonly deleteLine$ = this.lineStore.deleteLine$;
  readonly selectLine$ = this.lineStore.selectLine$;
  readonly changeLineColor$ = this.lineStore.changeLineColor$;

  readonly addLine$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() =>
        this.lineStore.lines$.pipe(
          take(1),
          map(lines => lines.reduce((acc, curr) => ({ ...acc, [curr.name]: true }), {} as { [key: string]: boolean }))
        )
      ),
      switchMap(lines =>
        from(this.generateLineName()).pipe(
          skipWhile(name => !!lines[name]),
          take(1)
        )
      ),
      tap(name => this.lineStore.addLine$(name))
    )
  );

  private readonly generateLineName = function* () {
    let index = 1;
    while (true) {
      yield `Line ${index}`;
      index = index + 1;
    }
  };

  constructor(private readonly lineStore: LineStore) {
    super({});
  }
}
