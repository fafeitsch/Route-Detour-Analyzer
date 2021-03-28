/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component } from '@angular/core';
import { LineStore } from './line.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [LineStore],
})
export class AppComponent {
  constructor(private readonly lineStore: LineStore) {}
}
