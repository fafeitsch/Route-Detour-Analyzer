/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { Line, LinesService } from '../../shared';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'lines-card',
  templateUrl: './lines-card.component.html',
  styleUrls: ['./lines-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinesCardComponent {
  @Input() lines: Line[] = [];

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly linesService: LinesService,
    private readonly router: Router
  ) {}

  async deleteLine(index: number, key: string) {
    const result = await this.linesService
      .deleteLine(key)
      .toPromise()
      .then(() => true)
      .catch(() => false);
    if (result) {
      this.lines = [...this.lines];
      this.lines.splice(index, 1);
      this.cd.markForCheck();
    }
  }

  createLine() {
    this.linesService
      .createLine()
      .pipe(take(1))
      .subscribe((line) => this.router.navigate(['route-editor', line.key]));
  }
}
