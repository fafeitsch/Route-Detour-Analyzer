/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TourScaffold } from '../timetable.store';
import { timeFormatValidator } from '../time-validator';
import {
  computeTime,
  formatTime,
  TimeString,
  Tour,
} from '../../+store/workbench';

@Component({
  selector: 'edit-tour-panel',
  templateUrl: './edit-tour-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-column w-100' },
})
export class EditTourPanelComponent implements OnDestroy {
  @Input() set editMode(value: boolean) {
    this._editMode = value;
    if (value) {
      this.startControl.disable();
    } else {
      this.startControl.enable();
    }
  }

  get editMode(): boolean {
    return this._editMode;
  }

  private _editMode = false;

  @Input() set tour(tour: Tour | undefined) {
    if (tour?.events.length) {
      this.startControl.setValue(tour?.events[0].departure);
    }
    this.intervalControl.setValue(tour?.intervalMinutes || undefined);
    this.lastTourControl.setValue(tour?.lastTour || undefined);
  }

  @Output() tourChanged = new EventEmitter<TourScaffold>();
  @Output() deleteTour = new EventEmitter<void>();

  startControl: AbstractControl;
  lastTourControl: AbstractControl;
  intervalControl: AbstractControl;
  formGroup: FormGroup;
  actualLastTour: undefined | TimeString = undefined;

  private readonly destroy$ = new Subject<void>();

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      start: [
        '6:00',
        Validators.compose([Validators.required, timeFormatValidator()]),
      ],
      lastTour: [
        '',
        Validators.compose([
          timeFormatValidator(),
          this.startBeforeEnd.bind(this),
        ]),
      ],
      interval: [
        '',
        Validators.compose([
          Validators.min(1),
          Validators.max(180),
          Validators.pattern(/^-?\d*$/),
        ]),
      ],
    });
    this.formGroup.markAllAsTouched();
    this.startControl = this.formGroup.controls.start;
    this.lastTourControl = this.formGroup.controls.lastTour;
    this.intervalControl = this.formGroup.controls.interval;

    this.lastTourControl.disable();
    this.intervalControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.lastTourControl.enable();
        } else {
          this.lastTourControl.setValue('');
          this.lastTourControl.disable();
        }
      });

    merge(
      this.startControl.valueChanges,
      this.lastTourControl.valueChanges,
      this.intervalControl.valueChanges
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.lastTourControl.updateValueAndValidity({ emitEvent: false });
        if (
          !this.intervalControl.value ||
          !this.lastTourControl.value ||
          this.startControl.invalid ||
          this.lastTourControl.invalid ||
          this.intervalControl.invalid
        ) {
          this.actualLastTour = undefined;
          return;
        }
        const absoluteStart = computeTime(this.startControl.value);
        const absoluteEnd = computeTime(this.lastTourControl.value);
        const difference = absoluteEnd - absoluteStart;
        const modulo = difference % this.intervalControl.value;
        if (modulo === 0) {
          this.actualLastTour = this.lastTourControl.value;
        } else {
          this.actualLastTour = formatTime(absoluteEnd - modulo);
        }
      });
  }

  private startBeforeEnd() {
    if (
      !this.startControl ||
      !this.lastTourControl ||
      !this.startControl.value ||
      !this.lastTourControl?.value ||
      this.startControl.errors?.invalidTimeFormat ||
      this.lastTourControl.errors?.invalidTimeFormat
    ) {
      return null;
    }
    const start = computeTime(this.startControl.value);
    const end = computeTime(this.lastTourControl.value);
    return end <= start ? { impossibleConfig: true } : null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  save(e: Event) {
    e.stopPropagation();
    this.tourChanged.emit({
      start: this.startControl.value,
      lastTour: this.actualLastTour,
      intervalMinutes: this.intervalControl.value,
    });
    this.tour = undefined;
  }

  delete() {
    this.deleteTour.emit();
  }
}
