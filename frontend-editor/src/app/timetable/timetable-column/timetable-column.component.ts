/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { timeFormatValidator } from '../time-validator';
import { merge, Observable, Subject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ArrivalDeparture, TimeString, Tour } from '../../shared';

@Component({
  selector: 'timetable-column',
  templateUrl: './timetable-column.component.html',
  styleUrls: ['./timetable-column.component.scss'],
  host: { class: 'd-flex timetable-column' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TimetableColumnComponent {
  @Input() set tour(value: (Tour & { uuid: string }) | undefined) {
    this.interval = value?.intervalMinutes || 0;
    this.lastTour = value?.lastTour;
    if (!value) {
      this.arrivalControls = [];
      this.departureControls = [];
      return;
    }
    if (this.uuid === value.uuid) {
      return;
    }
    this.events = value?.events || [];
    this.uuid = value.uuid;
    this.arrivalControls = value.events.map(
      (event) => new FormControl(event.arrival, timeFormatValidator())
    );
    this.arrivalControls.forEach((ctrl) => ctrl.markAsTouched());
    this.departureControls.forEach((ctrl) => ctrl.markAsTouched());
    this.departureControls = value.events.map(
      (event) => new FormControl(event.departure, timeFormatValidator())
    );
    this.internalChange.next(
      merge(
        ...[
          ...this.arrivalControls.map((control, index) =>
            control.valueChanges.pipe(map(() => index))
          ),
          ...this.departureControls.map((control, index) =>
            control.valueChanges.pipe(map(() => index))
          ),
        ]
      ).pipe(
        filter(
          (eventIndex) =>
            this.arrivalControls[eventIndex].valid &&
            this.departureControls[eventIndex].valid
        ),
        map((eventIndex) => ({
          eventIndex,
          event: {
            arrival: this.arrivalControls[eventIndex].value,
            departure: this.departureControls[eventIndex].value,
          },
        }))
      )
    );
  }
  private _tour: Tour | undefined = undefined;

  @Input() selected = false;

  @Output() selectTour = new EventEmitter<void>();

  private internalChange = new Subject<
    Observable<{ eventIndex: number; event: ArrivalDeparture }>
  >();
  @Output() changeEvent: Observable<{
    eventIndex: number;
    event: ArrivalDeparture;
  }> = this.internalChange.pipe(switchMap((obs) => obs));

  arrivalControls: FormControl[] = [];
  departureControls: FormControl[] = [];
  events: ArrivalDeparture[] = [];
  interval = 0;
  lastTour: TimeString | undefined = undefined;
  uuid: string | undefined = undefined;

  selectHandlerClicked() {
    this.selectTour.emit();
  }
}
