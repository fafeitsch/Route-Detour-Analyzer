/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  OptionsState,
  selectMapCenter,
  selectOsrmServer,
  selectTileServer,
  setMapCenterFromOptionsPanel,
  setOsrmServerFromOptionsPanel,
  setTileServerFromOptionsPanel,
} from '../../+store/options';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'settings-card',
  templateUrl: './settings-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsCardComponent implements OnDestroy {
  tileServerControl = new FormControl();
  osrmControl = new FormControl();
  mapCenterControl = new FormControl();
  private destroy$ = new Subject<void>();

  constructor(private readonly store: Store<OptionsState>) {
    this.tileServerControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(tileServer => this.store.dispatch(setTileServerFromOptionsPanel({ tileServer })));
    this.osrmControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(osrm => this.store.dispatch(setOsrmServerFromOptionsPanel({ osrm })));
    this.mapCenterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(mapOptions => this.parseAndStoreMapOptions(mapOptions));
    combineLatest([
      this.store.select(selectOsrmServer),
      this.store.select(selectTileServer),
      this.store.select(selectMapCenter),
    ])
      .pipe(take(1))
      .subscribe(([osrm, tileServer, mapOptions]) => {
        this.tileServerControl.setValue(tileServer, { emitEvent: false });
        this.osrmControl.setValue(osrm, { emitEvent: false });
        this.mapCenterControl.setValue(`${mapOptions.zoom}/${mapOptions.lat}/${mapOptions.lng}`);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  parseAndStoreMapOptions(value: string) {
    const split = value.split('/');
    if (split.length !== 3) {
      return;
    }
    if (isNaN(Number(split[0])) || isNaN(Number(split[1])) || isNaN(Number(split[2]))) {
      return;
    }
    this.store.dispatch(
      setMapCenterFromOptionsPanel({
        zoom: Number(split[0]),
        lat: Number(split[1]),
        lng: Number(split[2]),
      })
    );
  }
}
