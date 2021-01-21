/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component, OnInit } from '@angular/core';
import {Stop} from '../../+reducers';
import {Store} from '@ngrx/store';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {removeStop, renameStop, swapStops} from '../../+actions/actions';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'line-editor',
  templateUrl: './line-editor.component.html',
  styleUrls: ['./line-editor.component.scss']
})
export class LineEditorComponent  {
  line$ = this.store.select('line');

  editedStops = 0;

  constructor(private store: Store<{line: Stop[]}>) { }

  drop(event: CdkDragDrop<Stop[]>){
    this.store.dispatch(swapStops({i1: event.previousIndex, i2: event.currentIndex}))
  }

  dropOnTrash(event: CdkDragDrop<Stop[]>){
    console.log(event);
    this.store.dispatch(removeStop({i: event.previousIndex}));
  }

  changeName(index: number, name: string) {
    this.store.dispatch(renameStop({i: index, name}))
  }
}
