/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { TimetableStore } from './timetable.store';

@Component({
  selector: 'timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex overflow-auto' },
  providers: [TimetableStore],
})
export class TimetableComponent {
  readonly timetableSelected$ = this.route.paramMap.pipe(
    map((params) => params.get('timetable')),
    map((id) => !!id)
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: TimetableStore
  ) {}
}
