/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */

import { Component, OnInit } from '@angular/core';
import { LineStore } from '../line.store';
import { OptionsStore } from '../options-store.service';

@Component({
  selector: 'app-route-detour-analyzer',
  templateUrl: './route-detour-analyzer.component.html',
  styleUrls: ['./route-detour-analyzer.component.scss'],
  providers: [LineStore],
})
export class RouteDetourAnalyzerComponent {
  constructor(private readonly lineStore: LineStore, private readonly optionsStore: OptionsStore) {}
}
