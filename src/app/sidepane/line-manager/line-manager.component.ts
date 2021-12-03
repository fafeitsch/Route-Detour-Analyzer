/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component, HostBinding } from '@angular/core';
import { LineManagerStore } from './line-manager.store';
import { Line } from '../../line.store';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'line-manager',
  templateUrl: './line-manager.component.html',
  providers: [LineManagerStore],
})
export class LineManagerComponent {
  @HostBinding('class') clazz = 'd-flex flex-colum';

  lines$ = this.store.getLines$;
  selectedLine$ = this.store.getSelectedLine$;
  inlineEditLine = false;

  constructor(private readonly store: LineManagerStore) {}

  renameLine(oldName: string, newName: string) {
    this.store.renameLine$([oldName, newName]);
  }

  addLine() {
    this.store.addLine$();
  }

  deleteLine(line: Line) {
    this.store.deleteLine$(line);
  }

  selectLine(line: Line) {
    this.store.selectLine$(line);
  }

  changeColor(line: string, event: any) {
    this.store.changeLineColor$([line, event.target.value]);
  }

  trackBy(index: number, line: { name: string; color: string }) {
    return line.name;
  }

  toggleInlineEditor() {
    this.inlineEditLine = !this.inlineEditLine;
  }
}
