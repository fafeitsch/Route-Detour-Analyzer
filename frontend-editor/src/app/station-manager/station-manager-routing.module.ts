/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StationManagerComponent} from './station-manager.component';

const routes: Routes = [
  {
    path: '',
    component: StationManagerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationManagerRoutingModule {}
