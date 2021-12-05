/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StatisticsViewerStore } from '../statistics-viewer.store';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSettingsComponent implements OnDestroy, AfterViewInit {
  capControl: AbstractControl;

  private destroy$ = new Subject<boolean>();

  constructor(
    private readonly store: StatisticsViewerStore,
    private readonly formBuilder: FormBuilder,
    private readonly ref: ChangeDetectorRef
  ) {
    const form = this.formBuilder.group({
      tileServerUrl: [''],
      osrmServerUrl: [''],
      cap: [''],
    });
    this.capControl = form.controls.cap;
    this.store.setCap$(this.capControl.valueChanges);
  }

  ngAfterViewInit(): void {
    this.store.cap$.pipe(takeUntil(this.destroy$)).subscribe(cap => {
      this.capControl.patchValue(cap, { emitEvent: false });
      this.ref.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
