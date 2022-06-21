/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleComponent } from './vehicle.component';
import { VehicleEditorComponent } from './vehicle-editor/vehicle-editor.component';

const routes: Routes = [
  {
    path: '',
    component: VehicleComponent,
    children: [{ path: ':vehicle', component: VehicleEditorComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleRoutingModule {}
