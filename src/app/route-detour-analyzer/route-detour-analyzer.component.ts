/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LineStore } from '../line.store';

@Component({
  selector: 'app-route-detour-analyzer',
  templateUrl: './route-detour-analyzer.component.html',
  styleUrls: ['./route-detour-analyzer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 d-flex flex-column' },
  providers: [LineStore],
})
export class RouteDetourAnalyzerComponent {
  constructor(private readonly lineStore: LineStore) {}
}
