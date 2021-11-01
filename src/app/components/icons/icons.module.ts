/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT). Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PencilComponent} from './pencil.component';
import {CrossComponent} from './cross.component';
import {CheckmarkComponent} from '@rda/components/icons/checkmark.component';
import {LineStopComponent} from '@rda/components/icons/line-stop.component';
import {PlusComponent} from '@rda/components/icons/plus.component';
import {MinusComponent} from '@rda/components/icons/minus.component';

@NgModule({
  declarations: [PencilComponent, CrossComponent, CheckmarkComponent, LineStopComponent, PlusComponent, MinusComponent],
  exports: [PencilComponent, CrossComponent, CheckmarkComponent, LineStopComponent, PlusComponent, MinusComponent],
  imports: [CommonModule],
})
export class IconsModule {}
