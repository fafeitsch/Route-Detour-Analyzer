/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RouteDetourAnalyzerComponent } from './route-detour-analyzer.component';

const routes: Routes = [
  {
    path: '',
    component: RouteDetourAnalyzerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteDetourAnalyzerRoutingModule {}
