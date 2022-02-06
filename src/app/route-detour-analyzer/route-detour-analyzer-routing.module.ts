/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteDetourAnalyzerComponent } from './route-detour-analyzer.component';

const routes: Routes = [
  {
    path: '',
    component: RouteDetourAnalyzerComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'route-editor/:line',
        loadChildren: () => import('../route-editor/route-editor.module').then(m => m.RouteEditorModule),
      },
      {
        path: 'stations',
        loadChildren: () => import('../station-manager/station-manager.module').then(m => m.StationManagerModule),
      },
      {
        path: 'timetable/:line',
        loadChildren: () => import('../timetable/timetable.module').then(m => m.TimetableModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteDetourAnalyzerRoutingModule {}
