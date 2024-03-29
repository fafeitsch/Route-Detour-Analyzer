/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { LinesService, NotificationService, StationsService } from '../shared';
import { catchError, map, share, startWith } from 'rxjs/operators';
import { isDefined } from '../shared/utils';
import { forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dashboard h-100 d-flex flex-column' },
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent {
  exportLink = environment.backend + '/export';
  private readonly dashboard$ = forkJoin([
    this.linesService.getLinePaths(),
    this.stationsService.queryStations(),
  ]).pipe(
    catchError((err) => {
      this.notificationService.raiseNotification(
        'Could not load dashboard data: ' + err,
        'error'
      );
      return of([[], []]);
    }),
    map(([lines, stations]) => ({ lines, stations })),
    share()
  );
  readonly lines$ = this.dashboard$.pipe(map((dashboard) => dashboard.lines));
  readonly stations$ = this.dashboard$.pipe(
    isDefined(),
    map((dashboard) =>
      dashboard.stations.filter((station) => !station.isWaypoint)
    ),
    startWith([])
  );
  readonly waypoints$ = this.dashboard$.pipe(
    map((dashboard) =>
      dashboard.stations.filter((station) => station.isWaypoint)
    ),
    startWith([])
  );

  constructor(
    private linesService: LinesService,
    private readonly stationsService: StationsService,
    private readonly notificationService: NotificationService
  ) {}
}
