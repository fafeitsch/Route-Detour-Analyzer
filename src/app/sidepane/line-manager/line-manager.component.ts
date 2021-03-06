/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component } from '@angular/core';
import { LineManagerStore } from './line-manager.store';

@Component({
  selector: 'line-manager',
  templateUrl: './line-manager.component.html',
  styleUrls: ['./line-manager.component.scss'],
  providers: [LineManagerStore],
  host: { class: 'd-flex flex-column' },
})
export class LineManagerComponent {
  lines$ = this.store.getLines$;
  selectedLine$ = this.store.getSelectedLine$;

  constructor(private readonly store: LineManagerStore) {}

  renameLine(oldName: string, newName: string) {
    this.store.renameLine$([oldName, newName]);
  }

  addLine() {
    this.store.addLine$();
  }

  deleteLine(name: string) {
    this.store.deleteLine$(name);
  }

  selectLine(name: string) {
    this.store.selectLine$(name);
  }

  changeColor(color: string, name: string) {
    this.store.changeLineColor$([name, color]);
  }

  trackBy(index: number, line: { name: string; color: string }) {
    return line.name;
  }
}
