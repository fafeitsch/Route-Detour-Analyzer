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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'entity-list',
  templateUrl: './entity-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityListComponent<T> {
  @Input() addLabel = 'Add';
  @Input() entities: T[] = [];
  @Input() nameProperty = 'name';
  @Input() keyProperty = 'key';

  @Output() deleteEntity = new EventEmitter<string>();
  @Output() changeEntityName = new EventEmitter<T>();
  @Output() addEntity = new EventEmitter<void>();

  constructor(readonly route: ActivatedRoute) {}

  changeName(entity: T, newName: string) {
    // @ts-ignore
    entity[this.nameProperty] = newName;
    this.changeEntityName.emit(entity);
  }
}
