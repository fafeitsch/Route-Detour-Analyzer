/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Line, LineStore } from '../../line.store';
import { NotificationService } from '../../notification.service';
import { take } from 'rxjs/operators';
import FileSaver from 'file-saver';
import { importLines, Workbench } from '../../+store/workbench';
import { Store } from '@ngrx/store';

@Component({
  selector: 'import-export-card',
  styles: [``],
  templateUrl: './import-export-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportExportCardComponent {
  @ViewChild('fileInput')
  private fileInput: any;

  constructor(
    private readonly lineStore: LineStore,
    private readonly notificationService: NotificationService,
    private readonly store: Store<Workbench>
  ) {}

  exportWorkspace() {
    this.lineStore.lines$.pipe(take(1)).subscribe(lines => {
      const blob = new Blob([JSON.stringify(lines)], {
        type: 'application/json;charset=utf-8',
      });
      FileSaver.saveAs(blob, 'rda-network.json');
    });
  }

  exportWorkspaceLegacy() {
    this.lineStore.lines$.pipe(take(1)).subscribe(lines => {
      const result: { [key: string]: Line } = {};
      lines
        .map(line => ({ ...line }))
        .forEach(line => {
          line.path = undefined;
          result[line.name] = line;
          line.name = undefined!;
        });
      const blob = new Blob([JSON.stringify(result)], {
        type: 'application/json;charset=utf-8',
      });
      FileSaver.saveAs(blob, 'rda-network.json');
    });
  }

  exportSelectedLine() {
    this.lineStore.selectedLine$.pipe(take(1)).subscribe(line => {
      const blob = new Blob([JSON.stringify(line)], {
        type: 'application/json;charset=utf-8',
      });
      FileSaver.saveAs(blob, line.name + '.json');
    });
  }

  file: File | null = null;

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
        if (Array.isArray(parsedContent)) {
          const validationMessage = this.checkFileContent(parsedContent);
          if (validationMessage) {
            this.notificationService.raiseNotification('Cannot import file: ' + validationMessage);
          }
          this.store.dispatch(importLines({ lines: parsedContent }));
          this.lineStore.importLines$(parsedContent);
        } else if (parsedContent.name) {
          const validationMessage = this.checkFileContent([parsedContent]);
          if (validationMessage) {
            this.notificationService.raiseNotification('Cannot import file: ' + validationMessage);
          }
          this.lineStore.importLine$(parsedContent);
        } else {
          const validationMessage = this.checkFileContentMap(parsedContent);
          if (validationMessage) {
            this.notificationService.raiseNotification('Cannot import file: ' + validationMessage);
          }
          this.lineStore.importLineNameMap$(parsedContent);
        }
      } catch (e) {
        this.notificationService.raiseNotification('Cannot parse file: ' + e);
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
      const noColor = lines.filter(line => !line.color).map(line => line.name);
      if (noColor.length) {
        return 'The  lines in the array have no color: ' + noColor.join(', ');
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
}
