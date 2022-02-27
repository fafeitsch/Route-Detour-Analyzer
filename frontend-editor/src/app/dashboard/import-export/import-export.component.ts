/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {Domain, linesImported, Workbench} from '../../+store/workbench';
import {Store} from '@ngrx/store';
import {workbenchForExport} from '../../+store/workbench/selectors';
import FileSaver from 'file-saver';
import Line = Domain.Line;

@Component({
  selector: 'import-export',
  templateUrl: './import-export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-gap-2' },
})
export class ImportExportComponent {
  @ViewChild('fileInput')
  private fileInput: any;

  workbench$ = this.store.select(workbenchForExport);

  file: File | null = null;

  constructor(private store: Store<Workbench>) {}

  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.file = files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      try {
        let parsedContent = JSON.parse(reader.result as string);
        const validationMessage = this.checkFileContent(parsedContent.lines);
        if (validationMessage) {
          console.error(validationMessage);
          return;
        }
        this.store.dispatch(linesImported({ workbench: parsedContent }));
      } catch (e) {
        console.error(e);
      }
    };
    reader.readAsText(files[0]);
  }

  checkFileContentMap(lines: { [name: string]: Line }): string | undefined {
    try {
      let lineNames = Object.keys(lines);
      if (!lineNames.length) {
        return 'The imported file contained no lines.';
      }
      let withoutColor = lineNames.filter(name => !lines[name].color);
      if (withoutColor.length) {
        return 'The following keys have no color: ' + withoutColor.join(', ');
      }
      let withoutStops = lineNames.filter(name => !lines[name].stops);
      if (withoutStops.length) {
        return 'The following keys have no stops: ' + withoutStops.join(', ');
      }
    } catch (error) {
      return `Could not parse the workspace data: ${error}.`;
    }
    return undefined;
  }

  checkFileContent(lines: Line[]): string | undefined {
    try {
      const noNames = lines
        .map((line, index) => ({
          line,
          index,
        }))
        .filter(tuple => !tuple.line.name)
        .map(tuple => tuple.index);
      if (noNames.length) {
        return 'The following entries in the array have no line name: ' + noNames.join(', ');
      }
      const lineNameCounter: { [name: string]: number } = {};
      lines.forEach(line => (lineNameCounter[line.name] = (lineNameCounter[line.name] || 0) + 1));
      const duplicateLines = Object.keys(lineNameCounter)
        .filter(key => lineNameCounter[key] > 1)
        .join(', ');
      if (duplicateLines) {
        return 'The following line names are not distinct: ' + duplicateLines;
      }
      const noColor = lines.filter(line => !line.color).map(line => line.name);
      if (noColor.length) {
        return 'The lines in the array have no color: ' + noColor.join(', ');
      }
      const noStops = lines.filter(line => !line.stops).map(line => line.name);
      if (noStops.length) {
        return 'The following entries in the array have no stops name: ' + noStops.join(', ');
      }
    } catch (error) {
      return `Could not parse the workspace data: ${error}.`;
    }
    return undefined;
  }

  exportWorkbench(workbench: Workbench) {
    const blob = new Blob([JSON.stringify(workbench)], {
      type: 'application/json;charset=utf-8',
    });
    FileSaver.saveAs(blob, 'rda-network.json');
  }
}
