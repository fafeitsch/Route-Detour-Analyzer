import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OptionsService } from '../../options.service';
import { LineStore } from '../../line.store';

@Component({
  selector: 'evaluation-range-cap',
  templateUrl: './evaluation-range-cap.component.html',
  styleUrls: ['./evaluation-range-cap.component.scss'],
})
export class EvaluationRangeCapComponent implements OnDestroy {
  control: AbstractControl | undefined = undefined;
  numberOfStops$ = this.lineStore.getLine$.pipe(map((line) => line.filter((s) => s.realStop).length));

  private destroy$ = new Subject();

  constructor(
    formBuilder: FormBuilder,
    private readonly optionsService: OptionsService,
    private readonly lineStore: LineStore
  ) {
    const form = formBuilder.group({ cap: ['0'] });
    this.control = form.controls.cap;
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((cap) => this.optionsService.setCap(cap));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
