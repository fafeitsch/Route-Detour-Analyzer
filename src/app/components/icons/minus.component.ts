/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-minus',
  template:
    '<div class="h-100 d-flex align-items-flex-center justify-content-flex-center"><svg xmlns="http://www.w3.org/2000/svg" [attr.width]="iconWidth" [attr.height]="iconWidth"\n' +
    '     version="1.1">\n' +
    ' <line [attr.x1]="0" [attr.y1]="iconWidth/2" [attr.x2]="iconWidth" [attr.y2]="iconWidth/2" style="stroke:currentColor;stroke-width: 2"></line>' +
    '</svg></div>',
})
export class MinusComponent {
  @Input() iconWidth = 30;
}
