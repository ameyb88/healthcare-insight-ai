// app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'analyzer', pathMatch: 'full' },
  {
    path: 'analyzer',
    loadComponent: () =>
      import('./components/analyzer/analyzer.component').then(
        (m) => m.AnalyzerComponent
      ),
  },
  {
    path: 'insights',
    loadComponent: () =>
      import('./components/insights/insights.component').then(
        (m) => m.InsightsComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  { path: '**', redirectTo: 'analyzer' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
