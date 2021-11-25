/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OptionsStore } from '../../options-store.service';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSettingsComponent implements OnDestroy, AfterViewInit {
  tileServerControl: AbstractControl;
  osrmServerControl: AbstractControl;
  capControl: AbstractControl;

  private destroy$ = new Subject<boolean>();

  constructor(
    private readonly optionsStore: OptionsStore,
    private readonly formBuilder: FormBuilder,
    private readonly ref: ChangeDetectorRef
  ) {
    const form = this.formBuilder.group({
      tileServerUrl: [''],
      osrmServerUrl: [''],
      cap: [''],
    });
    this.tileServerControl = form.controls.tileServerUrl;
    this.osrmServerControl = form.controls.osrmServerUrl;
    this.capControl = form.controls.cap;
    this.optionsStore.setTileUrl$(this.tileServerControl.valueChanges.pipe(map(val => val.replace(/\$/, ''))));
    this.optionsStore.setOsrmUrl$(this.osrmServerControl.valueChanges);
    this.optionsStore.setCap$(this.capControl.valueChanges);
  }

  ngAfterViewInit(): void {
    this.optionsStore.osrmUrl$.pipe(takeUntil(this.destroy$)).subscribe(url => {
      this.osrmServerControl.patchValue(url, { emitEvent: false });
      this.ref.detectChanges();
    });
    this.optionsStore.tileServerUrl$.pipe(takeUntil(this.destroy$)).subscribe(url => {
      this.tileServerControl.patchValue(url, { emitEvent: false });
      this.ref.detectChanges();
    });
    this.optionsStore.cap$.pipe(takeUntil(this.destroy$)).subscribe(cap => {
      this.capControl.patchValue(cap, { emitEvent: false });
      this.ref.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
