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
  TemplateRef,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Station } from '../../shared';

@Component({
  selector: 'route-diagram',
  templateUrl: './route-diagram.component.html',
  styleUrls: ['./route-diagram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteDiagramComponent {
  @Input() color = '#000000';
  @Input() stations: Station[] = [];
  @Input() dragDisabled = true;
  @Input() focusedStation: Station | undefined = undefined;
  @Input() lowerTemplate: TemplateRef<any> | undefined = undefined;
  @Input() rightTemplate: TemplateRef<any> | undefined = undefined;

  @Output() changeOrder = new EventEmitter<{ from: number; to: number }>();
  @Output() focusStation = new EventEmitter<Station | undefined>();

  computedClass = 'test';

  drop(event: CdkDragDrop<Station[]>) {
    this.changeOrder.emit({
      from: event.previousIndex,
      to: event.currentIndex,
    });
  }

  hover(station: Station) {
    this.focusStation.emit(station);
  }

  unhover() {
    this.focusStation.emit(undefined);
  }
}
