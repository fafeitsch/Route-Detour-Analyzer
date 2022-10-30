import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TourSelectorComponent} from './tour-selector.component';
import {MatStepperModule} from '@angular/material/stepper';


@NgModule({
  declarations: [
    TourSelectorComponent
  ],
  exports: [
    TourSelectorComponent
  ],
  imports: [
    CommonModule,
    MatStepperModule
  ]
})
export class TourSelectorModule { }
