/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'line-stop',
  template:
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" [attr.width]="size" [attr.height]="size" version="1.1">' +
    '<rect *ngIf="!isFirstStop" x="20" class="fill-themed" height="50%" width="15px"></rect>' +
    '<rect *ngIf="!isLastStop" x="20" y="50%" class="fill-themed" height="100%" width="15px"></rect>' +
    ' <g *ngIf="realStop" transform="translate(12.498047,12.498047)" id="surface1">' +
    '    <path' +
    '       id="path3770"' +
    '       style="fill:#266133;fill-opacity:1;fill-rule:evenodd;stroke:none"' +
    '       d="M 15,0 C 11.023438,0 7.207031,1.582031 4.394531,4.394531 1.582031,7.207031 0,11.023438 0,15 c 0,3.980469 1.582031,7.796875 4.394531,10.609375 2.8125,2.8125 6.628907,4.394531 10.605469,4.394531 3.980469,0 7.796875,-1.582031 10.609375,-4.394531 2.8125,-2.8125 4.394531,-6.628906 4.394531,-10.609375 0,-3.976562 -1.582031,-7.792969 -4.394531,-10.605469 C 22.796875,1.582031 18.980469,0 15,0 Z m 0.0039,2.542969 c 3.296875,0 6.460938,1.308593 8.789063,3.640625 2.332031,2.332031 3.640625,5.492187 3.640625,8.789062 0,3.296875 -1.308594,6.460938 -3.640625,8.789063 -2.328125,2.332031 -5.492188,3.640625 -8.789063,3.640625 -3.296875,0 -6.457031,-1.308594 -8.789062,-3.640625 -2.332032,-2.328125 -3.640625,-5.492188 -3.640625,-8.789063 0,-3.296875 1.308593,-6.457031 3.640625,-8.789062 C 8.546869,3.851562 11.707025,2.542969 15.0039,2.542969 Z m 0,0" />' +
    '    <path' +
    '       id="path3772"' +
    '       style="fill:#d9bf21;fill-opacity:1;fill-rule:evenodd;stroke:none"' +
    '       d="m 27.433594,14.972656 c 0,3.296875 -1.308594,6.460938 -3.640625,8.789063 -2.328125,2.332031 -5.492188,3.640625 -8.789063,3.640625 -3.296875,0 -6.457031,-1.308594 -8.789062,-3.640625 -2.332032,-2.328125 -3.640625,-5.492188 -3.640625,-8.789063 0,-3.296875 1.308593,-6.457031 3.640625,-8.789062 2.332031,-2.332032 5.492187,-3.640625 8.789062,-3.640625 3.296875,0 6.460938,1.308593 8.789063,3.640625 2.332031,2.332031 3.640625,5.492187 3.640625,8.789062 z m 0,0" />' +
    '    <path' +
    '       id="path3774"' +
    '       style="fill:#266133;fill-opacity:1;fill-rule:evenodd;stroke:none"' +
    '       d="m 18.058594,6.144531 h 3.980468 v 17.660157 h -3.980468 v -7.425782 h -6.09375 v 7.425782 H 7.984375 V 6.144531 h 3.980469 v 7.515625 h 6.09375 z m 0,0" />' +
    '  </g><g *ngIf="!realStop"' +
    '     style="fill:#000000;fill-opacity:1;opacity:1;fill-rule:nonzero"\n' +
    '     transform="translate(12.498047,12.498047)"\n' +
    '     id="surface1">\n' +
    '    <circle r="15.059524" cy="15.001953" cx="15.001953" id="path4630"' +
    '       class="fill-themed" />\n' +
    '  </g>' +
    '</svg>',
})
export class LineStopComponent {
  size = 55;

  @Input() realStop: boolean = true;
  @Input() isFirstStop: boolean = false;
  @Input() isLastStop: boolean = false;

  @Input() set disabled(disabled: boolean) {
    if (disabled) {
      this.color1 = 'grey';
      this.color2 = 'darkgrey';
    } else {
      this.color1 = 'rgb(15.294118%,38.431373%,20.784314%)';
      this.color2 = 'rgb(85.098039%,75.294118%,13.333333%)';
    }
  }

  color1 = 'rgb(15.294118%,38.431373%,20.784314%)';
  color2 = 'rgb(85.098039%,75.294118%,13.333333%)';
}
