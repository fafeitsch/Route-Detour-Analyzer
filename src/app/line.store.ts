/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { forkJoin, Observable, of } from 'rxjs';
import { QueriedPath, RouteService, Stop } from './route.service';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { Injectable } from '@angular/core';

export interface Line {
  name: string;
  stops: Stop[];
  color: string;
  path?: QueriedPath;
}

const defaultLine: Line = { stops: [], color: '#3362da', name: 'Line 1' };

interface State {
  selectedLine: number;
  lines: Line[];
  showAllLines: boolean;
  minSubPathCount: 0;
}

@Injectable()
export class LineStore extends ComponentStore<State> {
  readonly selectedLine$ = super.select(state => state.lines[state.selectedLine]);
  readonly lines$ = super.select(state => state.lines);
  readonly visibleLines$ = super.select<(Line & { selected: boolean })[]>(state => {
    if (state.showAllLines) {
      return state.lines.map((line, index) => ({
        selected: index === state.selectedLine,
        ...line,
      }));
    }
    return [{ selected: true, ...state.lines[state.selectedLine] }];
  });
  readonly totalDistance$ = this.selectedLine$.pipe(
    map(line => line.path?.distanceTable || []),
    map(table => (table.length === 0 ? 0 : table[0][table.length - 1]))
  );

  private readonly updateSelectedLine$ = super.updater((state, line: Line) => {
    return {
      ...state,
      lines: state.lines.map((existing, index) => (index === state.selectedLine ? line : existing)),
    };
  });

  readonly renameStop$ = super.updater((state, [index, name]: [number, string]) => {
    const selectedLine = { ...state.lines[state.selectedLine] };
    selectedLine.stops[index] = { ...selectedLine.stops[index], name };
    return {
      ...state,
      lines: state.lines.map((line, index) => (index === state.selectedLine ? selectedLine : line)),
    };
  });

  private readonly setPathOfLine$ = super.updater((state, [index, path]: [number, QueriedPath]) => {
    const lines = [...state.lines];
    lines[index] = { ...state.lines[index], path };
    return { ...state, lines };
  });

  private readonly replaceLine$ = super.updater((state, [oldName, newName]: [string, string]) => ({
    ...state,
    lines: state.lines.map(line => (line.name === oldName ? { ...line, name: newName } : line)),
  }));
  readonly changeLineColor$ = super.updater((state, [line, color]: [string, string]) => {
    const selectedLine = { ...state.lines[state.selectedLine], color };
    return {
      ...state,
      lines: state.lines.map((line, index) => (index === state.selectedLine ? selectedLine : line)),
    };
  });
  readonly addLine$ = super.updater((state, name: string) => ({
    ...state,
    //TODO: Find a better way to set the theme color manually
    lines: [...state.lines, { stops: [], color: '#3362da', name }],
  }));
  readonly deleteLine$ = super.updater((state, line: Line) => {
    if (line === state.lines[state.selectedLine]) {
      this.notificationService.raiseNotification('The selected line cannot be removed.');
      return state;
    }
    const index = state.lines.indexOf(line);
    state.lines.splice(index, 1);
    return { ...state, lines: [...state.lines] };
  });
  private readonly setSelectedLine$ = super.updater((state, selectedLine: Line) => ({
    ...state,
    selectedLine: state.lines.indexOf(selectedLine),
  }));
  private readonly setToggleShowAll$ = super.updater(state => ({ ...state, showAllLines: !state.showAllLines }));

  readonly selectLine$ = super.effect((line$: Observable<Line>) =>
    line$.pipe(
      tap(line => this.setSelectedLine$(line)),
      tap(line => {
        if (!line.path) {
          this.queryPathAndUpdateLine$(line);
        }
      })
    )
  );

  readonly toggleShowAll$ = super.effect((trigger$: Observable<void>) =>
    trigger$.pipe(
      switchMap(() => this.lines$.pipe(take(1))),
      tap(() => this.setToggleShowAll$()),
      filter(lines => !!lines.length),
      switchMap(lines =>
        forkJoin([
          ...lines.map((line, index) =>
            line.path
              ? of(line.path)
              : this.routeService.queryOsrmRoute(line.stops).pipe(
                  tapResponse(
                    path => this.setPathOfLine$([index, path]),
                    () => this.notificationService.raiseNotification(`Could not fetch path for line "${line.name}."`)
                  )
                )
          ),
        ])
      )
    )
  );

  readonly addStopToLine$ = super.effect((stop$: Observable<Stop>) =>
    stop$.pipe(
      switchMap(s =>
        this.routeService.queryNearestStreet(s).pipe(
          catchError<Stop, Observable<any>>(() => {
            this.notificationService.raiseNotification('Could not query name for stop. Using default name instead.');
            return of(stop);
          })
        )
      ),
      switchMap(stop => this.selectedLine$.pipe(take(1)).pipe(map(line => ({ stop, line })))),
      map(({ stop, line }) => ({ ...line, stops: [...line.stops, stop] })),
      tap(line => this.queryPathAndUpdateLine$(line))
    )
  );

  readonly removeStopFromLine$ = super.effect((index$: Observable<number>) =>
    index$.pipe(
      switchMap(stop => this.selectedLine$.pipe(take(1)).pipe(map(line => ({ stop, line })))),
      tap(({ stop, line }) => {
        line.stops.splice(stop, 1);
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  readonly moveStopOfLine$ = super.effect((index$: Observable<{ from: number; to: number }>) =>
    index$.pipe(
      switchMap(movement =>
        this.selectedLine$.pipe(take(1)).pipe(
          map(line => ({
            ...line,
            stops: [...line.stops],
          })),
          map(line => ({ movement, line }))
        )
      ),
      tap(({ movement, line }) => {
        const taken = line.stops.splice(movement.from, 1);
        line.stops.splice(movement.to, 0, taken[0]);
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  readonly toggleStopOfLine$ = super.effect((index$: Observable<number>) =>
    index$.pipe(
      switchMap(index =>
        this.selectedLine$.pipe(take(1)).pipe(
          map(line => ({
            ...line,
            stops: [...line.stops],
          })),
          map(line => ({ line, index }))
        )
      ),
      tap(({ index, line }) => {
        line.stops[index].realStop = !line.stops[index].realStop;
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  readonly replaceStopOfLine$ = super.effect((replacement$: Observable<{ index: number; stop: Stop }>) =>
    replacement$.pipe(
      switchMap(replacement => {
        if (!replacement.stop.name) {
          return this.routeService
            .queryNearestStreet(replacement.stop)
            .pipe(
              map(s => ({
                index: replacement.index,
                stop: s,
              }))
            )
            .pipe(
              catchError(() => {
                this.notificationService.raiseNotification(
                  'Could not query name for stop. Using default name instead.'
                );
                return of(replacement);
              })
            );
        }
        return of(replacement);
      }),
      switchMap(replacement =>
        this.selectedLine$.pipe(take(1)).pipe(
          map(line => ({
            ...line,
            stops: [...line.stops],
          })),
          map(line => ({ line, replacement }))
        )
      ),
      tap(({ replacement, line }) => {
        line.stops[replacement.index] = replacement.stop;
        this.queryPathAndUpdateLine$(line);
      })
    )
  );

  private readonly queryPathAndUpdateLine$ = super.effect((line$: Observable<Line>) =>
    line$.pipe(
      switchMap(line =>
        this.routeService
          .queryOsrmRoute(line.stops)
          .pipe(map(path => ({ ...line, path })))
          .pipe(
            tapResponse(
              l => this.updateSelectedLine$(l),
              err => {
                console.error(err);
                this.notificationService.raiseNotification(`Could not query path for line "${line.name}\"`);
              }
            )
          )
      )
    )
  );

  readonly importLineNameMap$ = super.effect((lines$: Observable<{ [name: string]: Line }>) =>
    lines$.pipe(
      map(lines =>
        Object.keys(lines)
          .sort()
          .map(name => ({ ...lines[name], name }))
      ),
      tap(lines => super.patchState({ lines, selectedLine: 0 })),
      tap(lines => this.queryPathAndUpdateLine$(lines[0]))
    )
  );

  readonly importLines$ = super.effect((lines$: Observable<Line[]>) =>
    lines$.pipe(
      tap(lines => super.patchState({ lines, selectedLine: 0 })),
      tap(lines => this.queryPathAndUpdateLine$(lines[0]))
    )
  );

  readonly importLine$ = super.effect((line$: Observable<Line>) =>
    line$.pipe(
      switchMap(line =>
        this.lines$.pipe(
          take(1),
          map(lines => [...lines, line])
        )
      ),
      tap(x => console.log(x)),
      map(lines => ({ lines, valid: lines.filter(line => line.name === lines[lines.length - 1].name).length === 1 })),
      tap(({ lines, valid }) => {
        if (!valid) {
          this.notificationService.raiseNotification(
            `A line with the name "${lines[lines.length - 1].name}" does already exist.`
          );
        }
      }),
      filter(({ valid }) => valid),
      tap(({ lines }) => super.patchState({ lines, selectedLine: lines.length - 1 })),
      tap(({ lines }) => this.queryPathAndUpdateLine$(lines[lines.length - 1]))
    )
  );

  readonly renameLine$ = super.effect((name$: Observable<[string, string]>) =>
    name$.pipe(
      switchMap(names =>
        this.lines$.pipe(
          take(1),
          map(lines => Object.keys(lines)),
          map<string[], [string, string, string[]]>(lines => [...names, lines])
        )
      ),
      tap(([oldName, newName, lines]) => {
        if (lines.includes(newName)) {
          this.notificationService.raiseNotification(
            `Could not rename line "${oldName}" to "${newName}" because there already is a line with the name.`
          );
        } else {
          this.replaceLine$([oldName, newName]);
        }
      })
    )
  );

  constructor(private readonly routeService: RouteService, private readonly notificationService: NotificationService) {
    super({
      selectedLine: 0,
      lines: [defaultLine],
      minSubPathCount: 0,
      showAllLines: false,
    });
  }
}
