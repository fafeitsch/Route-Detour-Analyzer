/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { Options, updateOsrmServerUrl, updateTileServerUrl } from '../../+store/options';

@Component({
  selector: 'external-settings',
  templateUrl: './external-settings.component.html',
  styleUrls: ['./external-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalSettingsComponent implements OnDestroy {
  tileServerControl: AbstractControl;
  osrmServerControl: AbstractControl;
  private destroy$ = new Subject<boolean>();

  constructor(private readonly store: Store<{ options: Options }>, private readonly formBuilder: FormBuilder) {
    const form = this.formBuilder.group({
      tileServerUrl: '',
      osrmServerUrl: '',
    });
    this.tileServerControl = form.controls.tileServerUrl;
    this.osrmServerControl = form.controls.osrmServerUrl;
    this.tileServerControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        map((value) => value.replace('$', ''))
      )
      .subscribe((value) => this.store.dispatch(updateTileServerUrl({ tileServer: value })));
    this.osrmServerControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.store.dispatch(updateOsrmServerUrl({ osrmServer: value })));
    this.store.pipe(select('options'), takeUntil(this.destroy$)).subscribe((state) => {
      this.tileServerControl.patchValue(state.tileServer, { emitEvent: false });
      this.osrmServerControl.patchValue(state.osrmServer, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
