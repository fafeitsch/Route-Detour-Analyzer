import { Component, Input } from '@angular/core';
import { DetourWithStop } from '../statistics-viewer.store';

@Component({
  selector: 'single-statistics',
  templateUrl: './single-statistics.component.html',
})
export class SingleStatisticsComponent {
  @Input() result: DetourWithStop | undefined = undefined;
  @Input() title = '';
  @Input() average = 0;
  @Input() lineColor = '';
}
