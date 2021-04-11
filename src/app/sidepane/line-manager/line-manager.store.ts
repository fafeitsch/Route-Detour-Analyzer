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
  readonly getLines$ = this.lineStore.getLines$.pipe(
    map((lines) => Object.keys(lines).map((name) => ({ name, stops: lines[name].length })))
  );

  readonly getSelectedLine$ = this.lineStore.getSelectedLine$;
  readonly renameLine$ = this.lineStore.renameLine$;
  readonly deleteLine$ = this.lineStore.deleteLineWithName$;
  readonly selectLine$ = this.lineStore.selectLine$;

  readonly addLine$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.lineStore.getLines$.pipe(take(1))),
      switchMap((lines) =>
        from(this.generateLineName()).pipe(
          skipWhile((name) => !!lines[name]),
          take(1)
        )
      ),
      tap((name) => this.lineStore.addLine$(name))
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
