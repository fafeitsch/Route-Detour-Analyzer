/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Line, lines, Workbench } from '../+store/workbench';
import { Store } from '@ngrx/store';
import FileSaver from 'file-saver';

@Component({
  selector: 'export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'overflow-hidden d-flex flex-column h-100' },
})
export class ExportComponent {
  lines$ = this.store.select(lines);
  excludedExportLines: { [name: string]: boolean } = {};
  exportAsMap = false;
  includeWaypoints = true;

  constructor(private readonly store: Store<Workbench>) {}

  toggleExcludeLine(name: string) {
    this.excludedExportLines[name] = !this.excludedExportLines[name];
  }

  excludeNone() {
    this.excludedExportLines = {};
  }

  excludeAll(lines: Line[]) {
    lines.forEach(line => (this.excludedExportLines[line.name] = true));
  }

  exportLines(allLines: Line[]) {
    const exportedLines = allLines.filter(line => !this.excludedExportLines[line.name]).map(line => ({ ...line }));
    if (!this.includeWaypoints) {
      exportedLines.forEach(line => (line.path = undefined!));
    }
    if (this.exportAsMap) {
      const result: { [key: string]: Line } = {};
      exportedLines.forEach(line => {
        result[line.name] = line;
        line.name = undefined!;
      });
      const blob = new Blob([JSON.stringify(result)], {
        type: 'application/json;charset=utf-8',
      });
      FileSaver.saveAs(blob, 'rda-network.json');
      exportedLines.forEach(line => (line.name = undefined!));
    } else {
      const blob = new Blob([JSON.stringify(exportedLines)], {
        type: 'application/json;charset=utf-8',
      });
      FileSaver.saveAs(blob, 'rda-network.json');
    }
  }
}
