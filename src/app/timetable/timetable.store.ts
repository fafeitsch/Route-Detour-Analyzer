/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore } from '@ngrx/component-store';
import { Domain, lines, Workbench } from '../+store/workbench';
import { map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import Line = Domain.Line;

interface State {
  line: Line | undefined;
}

@Injectable()
export class TimetableStore extends ComponentStore<State> {
  readonly line$ = super.select(state => state.line);

  readonly selectLineFromRoute$ = super.effect(() =>
    this.route.paramMap.pipe(
      map(params => params.get('line')),
      switchMap(lineName =>
        this.store.select(lines).pipe(
          map(lines => lines.find(line => line.name === lineName)),
          map(line => (!line ? undefined : { ...line })),
          tap(line => super.patchState({ line }))
        )
      )
    )
  );

  constructor(private readonly route: ActivatedRoute, private readonly store: Store<Workbench>) {
    super({ line: undefined });
  }
}
