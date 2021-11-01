/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {Component, ViewChild} from '@angular/core';
import {Line, LineStore} from '../../line.store';
import {take, tap} from 'rxjs/operators';
import FileSaver from 'file-saver';
import {NotificationService} from '../../notification.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'import-export',
  templateUrl: './import-export.component.html',
})
export class ImportExportComponent {
  @ViewChild('fileInput')
  private fileInput: any;

  constructor(private readonly lineStore: LineStore, private readonly notificationService: NotificationService) {
  }

  exportWorkspace() {
    this.lineStore.getLines$.pipe(take(1)).subscribe(lines => {
      const blob = new Blob([JSON.stringify(lines)], {type: 'application/json;charset=utf-8'});
      FileSaver.saveAs(blob, 'rda-network.json');
    });
  }

  exportSelectedLine() {
    forkJoin([
      this.lineStore.getSelectedLine$.pipe(take(1), tap(x => console.log(x))),
      this.lineStore.getLine$.pipe(take(1), tap(x => console.log(x))),
      this.lineStore.getSelectedPath$.pipe(take(1), tap(x => console.log(x)))
    ]).subscribe(
      ([name, line, path]) => {
        const blob = new Blob([JSON.stringify({name, ...line, ...path})], {type: 'application/json;charset=utf-8'});
        FileSaver.saveAs(blob, name + '.json');
      }
    )
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
        let lines = JSON.parse(reader.result as string);
        const validationMessage = this.checkFileContent(lines);
        if (validationMessage) {
          this.notificationService.raiseNotification('Cannot import file: ' + validationMessage);
        }
        this.lineStore.importLines$(lines);
      } catch (e) {
        this.notificationService.raiseNotification('Cannot parse file: ' + e);
      }
    };
    reader.readAsText(files[0]);
  }

  checkFileContent(lines: { [name: string]: Line }): string | undefined {
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
    return undefined;
  }
}
