/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Observable, of } from 'rxjs';
import { QueriedPath, RouteService, Stop } from './route.service';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { Injectable } from '@angular/core';

export interface Line {
  stops: Stop[];
  color: string;
}

interface State {
  selectedLine: string;
  lines: { [name: string]: Line };
  path: QueriedPath;
  minSubPathCount: 0;
}

@Injectable()
export class LineStore extends ComponentStore<State> {
  readonly getSelectedLine$ = super.select((state) => state.selectedLine);
  readonly getLines$ = super.select((state) => state.lines);
  readonly getLine$ = super.select((state) => state.lines[state.selectedLine]);
  readonly getPath$ = super.select((state) => state.path);
  readonly getTotalDistance$ = super
    .select((state) => state.path)
    .pipe(
      map((path) => path.distanceTable),
      filter((table) => table.length > 0),
      map((table) => table[0][table.length - 1])
    );

  private readonly addStop$ = super.updater((state, stop: Stop) => {
    const selectedLine = state.lines[state.selectedLine];
    selectedLine.stops.push(stop);
    const newState = {
      ...state,
      lines: { ...state.lines },
    };
    newState.lines[state.selectedLine] = { ...selectedLine };
    return newState;
  });
  readonly removeStop$ = super.updater((state, index: number) => {
    const line = state.lines[state.selectedLine];
    line.stops.splice(index, 1);
    const newState = {
      ...state,
      lines: { ...state.lines },
    };
    newState.lines[state.selectedLine] = { ...line };
    return newState;
  });
  readonly moveStop$ = super.updater((state, [from, to]: [number, number]) => {
    const line = state.lines[state.selectedLine];
    const taken = line.stops.splice(from, 1);
    line.stops.splice(to, 0, taken[0]);
    const newState = {
      ...state,
      lines: { ...state.lines },
    };
    newState.lines[state.selectedLine] = { ...line };
    return newState;
  });
  readonly renameStop$ = super.updater((state, [index, name]: [number, string]) => {
    const line = state.lines[state.selectedLine];
    line.stops[index] = { ...line.stops[index], name };
    const newState = {
      ...state,
      lines: { ...state.lines },
    };
    newState.lines[state.selectedLine] = { ...line };
    return newState;
  });
  readonly toggleRealStop$ = super.updater((state, index: number) => {
    const line = state.lines[state.selectedLine];
    line.stops[index] = { ...line.stops[index], realStop: !line.stops[index].realStop };
    const newState = {
      ...state,
      lines: { ...state.lines },
    };
    newState.lines[state.selectedLine] = { ...line };
    return newState;
  });
  readonly replaceStop$ = super.updater((state, [replacement, index]: [Stop, number]) => {
    const line = state.lines[state.selectedLine];
    line.stops[index] = { ...replacement };
    const newState = {
      ...state,
      lines: { ...state.lines },
    };
    newState.lines[state.selectedLine] = { ...line };
    return newState;
  });
  private readonly replaceLine$ = super.updater((state, [oldName, newName]: [string, string]) => {
    const selectedLine = state.selectedLine === oldName ? newName : state.selectedLine;
    const line = state.lines[oldName];
    const lines = { ...state.lines };
    delete lines[oldName];
    lines[newName] = line;
    return { ...state, selectedLine, lines };
  });
  readonly changeLineColor$ = super.updater((state, [line, color]: [string, string]) => {
    const selected = state.lines[line];
    const lines = { ...state.lines };
    lines[line] = { ...selected, color };
    return { ...state, lines };
  });
  readonly addLine$ = super.updater((state, name: string) => {
    const lines = { ...state.lines };
    //TODO: Find a better way to set the theme color manually
    lines[name] = { stops: [], color: '#3362da' };
    return { ...state, lines };
  });
  private readonly deleteLine$ = super.updater((state, name: string) => {
    const lines = { ...state.lines };
    delete lines[name];
    return { ...state, lines };
  });
  readonly selectLine$ = super.updater((state, selectedLine: string) => ({ ...state, selectedLine }));

  readonly addStopToLine$ = super.effect((stop$: Observable<Stop>) =>
    stop$.pipe(switchMap((s) => this.queryNearestStop(s, this.addStop$.bind(this))))
  );

  readonly replaceStopOfLine$ = super.effect((replacement$: Observable<Stop & { index: number }>) =>
    replacement$.pipe(
      switchMap((replacement) => {
        if (!replacement.name) {
          return this.queryNearestStop(replacement, (stop) => this.replaceStop$([stop, replacement.index]));
        }
        return of(replacement).pipe(tap((stop) => this.replaceStop$([stop, stop.index])));
      })
    )
  );

  readonly queryPath$ = super.effect(() =>
    this.getLine$.pipe(
      switchMap((line) => this.routeService.queryOsrmRoute(line.stops)),
      tap((path) => super.patchState({ path }))
    )
  );

  readonly renameLine$ = super.effect((name$: Observable<[string, string]>) =>
    name$.pipe(
      switchMap((names) =>
        this.getLines$.pipe(
          take(1),
          map((lines) => Object.keys(lines)),
          map<string[], [string, string, string[]]>((lines) => [...names, lines])
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

  readonly deleteLineWithName$ = super.effect((name$: Observable<string>) =>
    name$.pipe(
      switchMap((name) => this.getSelectedLine$.pipe(map((selected) => [name, selected]))),
      tap(([name, selected]) => {
        if (name === selected) {
          this.notificationService.raiseNotification('The selected line cannot be removed.');
        } else {
          this.deleteLine$(name);
        }
      })
    )
  );

  constructor(private readonly routeService: RouteService, private readonly notificationService: NotificationService) {
    super({
      selectedLine: 'Line 1',
      //TODO: Find a better way to set the theme color manually
      lines: { 'Line 1': { stops: [], color: '#3362da' } },
      minSubPathCount: 0,
      path: { distanceTable: [], waypoints: [] },
    });
  }

  private queryNearestStop(stop: Stop, consumer: (stop: Stop) => void) {
    return this.routeService.queryNearestStreet(stop).pipe(
      tapResponse(consumer, () => {
        this.notificationService.raiseNotification(
          'Could query not nearest address. Is your OSRM URL configured correctly?'
        );
      })
    );
  }
}
