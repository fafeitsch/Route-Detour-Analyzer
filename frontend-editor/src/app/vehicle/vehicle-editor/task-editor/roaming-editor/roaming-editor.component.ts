import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
} from '@angular/core';
import { RoamingEditorStore } from './roaming-editor-store';
import { LatLng, timeFormatValidator, TimeString } from '../../../../shared';
import { isDefined } from '../../../../shared/utils';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'roaming-editor',
  templateUrl: './roaming-editor.component.html',
  styleUrls: ['./roaming-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoamingEditorStore],
  host: { class: 'd-flex flex-column' },
})
export class RoamingEditorComponent {
  @Input() set lastPosition(latLng: LatLng) {
    this.store.setStart(latLng);
  }
  @Output() selectTask = this.store.task$;

  startTimeControl = new FormControl('0:00', [timeFormatValidator()]);
  lastPosition$ = this.store.start$;
  path$ = this.store.fakeLine$.pipe(isDefined());

  constructor(private readonly store: RoamingEditorStore) {
    store.setStartTime(
      this.startTimeControl.valueChanges as Observable<TimeString>
    );
  }

  endSelected(end: LatLng) {
    this.store.setEnd(end);
  }
}
