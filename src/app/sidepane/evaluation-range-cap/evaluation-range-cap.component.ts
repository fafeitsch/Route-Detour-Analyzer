import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Options, updateEvaluationCap } from '../../+store/options';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Stop } from '../../+store/types';

@Component({
  selector: 'evaluation-range-cap',
  templateUrl: './evaluation-range-cap.component.html',
  styleUrls: ['./evaluation-range-cap.component.scss'],
})
export class EvaluationRangeCapComponent implements OnDestroy {
  control: AbstractControl | undefined = undefined;
  numberOfStops$ = this.store.select('line').pipe(map((line) => line.length));

  private destroy$ = new Subject();

  constructor(formBuilder: FormBuilder, private readonly store: Store<{ options: Options; line: Stop[] }>) {
    const form = formBuilder.group({ cap: ['0'] });
    this.control = form.controls.cap;
    this.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((cap) => store.dispatch(updateEvaluationCap({ cap })));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
