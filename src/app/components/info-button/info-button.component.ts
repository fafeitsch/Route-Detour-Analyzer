import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';

@Component({
  selector: 'info-button',
  templateUrl: './info-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoButtonComponent {
  size = 30;
  @Input() info = '';
}
