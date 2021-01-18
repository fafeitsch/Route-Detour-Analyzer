/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {updateOsrmServerUrl, updateTileServerUrl} from '../../+actions/actions';
import {AbstractControl, FormBuilder} from '@angular/forms';
import {Subject} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';

@Component({
  selector: 'app-external-settings',
  templateUrl: './external-settings.component.html',
  styleUrls: ['./external-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalSettingsComponent implements OnDestroy {

  tileServerControl: AbstractControl;
  osrmServerControl: AbstractControl;
  private destroy$ = new Subject<boolean>();

  constructor(private readonly globalStore: Store<{ tileServer: string, osrmServer: string}>,
              private readonly formBuilder: FormBuilder) {
    const form = this.formBuilder.group({tileServerUrl: '', osrmServerUrl: ''});
    this.tileServerControl = form.controls.tileServerUrl;
    this.osrmServerControl = form.controls.osrmServerUrl;
    this.tileServerControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      map(value => value.replace('$', ''))
    ).subscribe(value => this.globalStore.dispatch(updateTileServerUrl({url: value})));
    this.osrmServerControl.valueChanges.pipe(
      takeUntil(this.destroy$)).subscribe(value => this.globalStore.dispatch(updateOsrmServerUrl({url: value})))
    this.globalStore.select('tileServer').pipe(
      takeUntil(this.destroy$)).subscribe(url => this.tileServerControl.patchValue(url, {emitEvent: false}));
    this.globalStore.select('osrmServer').pipe(
      takeUntil(this.destroy$)).subscribe(url => this.osrmServerControl.patchValue(url, {emitEvent: false}));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
