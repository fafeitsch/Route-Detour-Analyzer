/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';
import { OptionsStore } from '../../options-store.service';
import { LineStore } from '../../line.store';

@Component({
  selector: 'evaluation-range-cap',
  templateUrl: './evaluation-range-cap.component.html',
})
export class EvaluationRangeCapComponent {
  control: AbstractControl | undefined = undefined;
  numberOfStops$ = this.lineStore.getLine$.pipe(map(line => line.stops.filter(s => s.realStop).length));

  constructor(
    formBuilder: FormBuilder,
    private readonly optionsService: OptionsStore,
    private readonly lineStore: LineStore
  ) {
    const form = formBuilder.group({ cap: ['0'] });
    this.control = form.controls.cap;
    this.optionsService.setCap$(this.control.valueChanges);
  }
}
