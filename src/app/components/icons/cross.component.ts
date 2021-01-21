import {Component, Input} from '@angular/core';

@Component({
  selector: 'icon-cross',
  template: '<div class="h-100 d-flex align-items-flex-center justify-content-flex-center"><svg xmlns="http://www.w3.org/2000/svg" [attr.width]="iconWidth" [attr.height]="iconWidth"\n' +
    '     version="1.1">\n' +
    ' <line [attr.x1]="insets" [attr.y1]="insets" [attr.x2]="iconWidth-insets" [attr.y2]="iconWidth- insets" style="stroke:black;stroke-width: 2"></line>' +
    ' <line [attr.x1]="iconWidth-insets" [attr.y1]="insets" [attr.x2]="insets" [attr.y2]="iconWidth- insets" style="stroke:black;stroke-width: 2"></line>' +
    '</svg></div>'
})
export class CrossComponent {
  @Input() set size(size: number) {
    this.iconWidth = size;
  }

  iconWidth = 30;
  insets = 8;
}
