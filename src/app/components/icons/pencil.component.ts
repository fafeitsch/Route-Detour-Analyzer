import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'icon-pencil',
  template: '<div class="h-100 d-flex align-items-flex-center justify-content-flex-center"><svg xmlns="http://www.w3.org/2000/svg" [attr.width]="iconWidth" [attr.height]="iconWidth"\n' +
    '     version="1.1">\n' +
    ' <g [attr.transform]="\'rotate(45,\'+iconWidth/2+\',\'+iconWidth/2+\')\'">' +
    ' <rect [attr.x]="penX" [attr.y]="penY" [attr.height]="penHeight" [attr.width]="penWidth" style="fill: black"></rect>' +
    ' <polygon [attr.points]="penX+\',\' + triangleY + \' \' + (penX + penWidth) + \',\' + triangleY + \' \' + (penX + penWidth/2) + \',\' + iconWidth"></polygon>' +
    ' </g>' +
    '</svg></div>'
})
export class PencilComponent {
  @Input() set size(size: number) {
    this.iconWidth = size;
  }

  iconWidth = 30;
  penHeight = 22;
  penWidth = 5;
  penX = 12;
  penY = 0;
  triangleY = 24;
}
