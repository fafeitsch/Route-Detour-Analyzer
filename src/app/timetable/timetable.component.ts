/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TimetableStore } from './timetable.store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TimetableStore],
})
export class TimetableComponent implements OnInit {
  line$ = this.store.line$;
  durationToNext$ = this.line$.pipe(
    map(line => line?.path.waypoints),
    map(waypoints => {
      let duration = 0;
      const result: number[] = [];
      waypoints?.forEach((wp, index) => {
        if (index === 0) {
          return;
        }
        if (wp.stop) {
          result.push(duration);
          duration = 0;
        }
        console.log(duration, wp.dur);
        duration = duration + wp.dur;
      });
      result.push(duration);
      return result;
    })
  );

  constructor(private readonly store: TimetableStore) {}

  ngOnInit(): void {}
}
