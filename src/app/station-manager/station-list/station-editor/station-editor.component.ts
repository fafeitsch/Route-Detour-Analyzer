/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DataModel, Station } from '../../../+store/workbench';
import Line = DataModel.Line;

@Component({
  selector: 'station-editor',
  templateUrl: './station-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-gap-3 align-items-start p-2' },
})
export class StationEditorComponent {
  @Input() station: Station | undefined = undefined;
  @Input() stations: Station[] = [];

  @Input() set stationUsage(stationUsage: Line[]) {
    this.usedByLines = stationUsage.map(line => line.name);
    this.usedByLinesTooltip = this.usedByLines.join('\n');
  }

  usedByLines: string[] = [];
  usedByLinesTooltip: string = '';

  @Output() focusStation = new EventEmitter<void>();
  @Output() unfocusStation = new EventEmitter<void>();
  @Output() deleteStation = new EventEmitter<string | undefined>();
  @Output() centerOnStation = new EventEmitter<void>();
  @Output() renameStation = new EventEmitter<string>();

  mode: 'normal' | 'delete' = 'normal';
  replacement: string | undefined = undefined;

  deleteClicked() {
    if (this.mode === 'normal') {
      this.mode = 'delete';
    } else if (this.mode === 'delete') {
      this.deleteStation.emit(this.replacement);
    }
  }

  replacementSelectionChanged(key: string) {
    this.replacement = key;
  }

  switchToNormal() {
    this.mode = 'normal';
  }

  editStationName(name: string) {
    this.renameStation.emit(name);
  }
}
