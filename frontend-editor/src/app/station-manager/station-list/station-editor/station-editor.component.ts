/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Station } from '../../../shared';

@Component({
  selector: 'station-editor',
  templateUrl: './station-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-flex flex-gap-3 align-items-start p-2' },
})
export class StationEditorComponent {
  @Input() set station(value: Station | undefined) {
    this._station = value;
    this.usedByLinesTooltip =
      this._station?.lines.map((line) => line.name).join('\n') || '';
  }

  get station(): Station | undefined {
    return this._station;
  }

  private _station: Station | undefined = undefined;

  @Input() stations: Station[] = [];

  usedByLinesTooltip = '';

  @Output() focusStation = new EventEmitter<void>();
  @Output() unfocusStation = new EventEmitter<void>();
  @Output() deleteStation = new EventEmitter<void>();
  @Output() centerOnStation = new EventEmitter<void>();
  @Output() renameStation = new EventEmitter<string>();
  @Output() toggleWaypoint = new EventEmitter<void>();

  deleteClicked() {
    this.deleteStation.emit();
  }

  editStationName(name: string) {
    this.renameStation.emit(name);
  }

  waypointToggled() {
    this.toggleWaypoint.emit();
  }
}
