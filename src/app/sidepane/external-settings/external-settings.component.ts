/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { OptionsService } from '../../options.service';

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

  constructor(private readonly optionsService: OptionsService, private readonly formBuilder: FormBuilder) {
    const form = this.formBuilder.group({
      tileServerUrl: '',
      osrmServerUrl: '',
    });
    this.tileServerControl = form.controls.tileServerUrl;
    this.osrmServerControl = form.controls.osrmServerUrl;
    this.tileServerControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        map(value => value.replace('$', ''))
      )
      .subscribe(url => this.optionsService.setTileServerUrl(url));
    this.osrmServerControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => this.optionsService.setOsrmUrl(url));
    this.optionsService
      .getOsrmUrl()
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => this.osrmServerControl.patchValue(url, { emitEvent: false }));
    this.optionsService
      .getTileServerUrl()
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => this.tileServerControl.patchValue(url, { emitEvent: false }));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
