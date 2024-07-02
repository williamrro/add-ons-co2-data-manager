import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './shared/landing/landing.component';
import { DTComponent } from './components/fps/datatable/datatable.component';
import { SummaryComponent } from './components/t4/summary/summary.component';

const routes: Routes = [
	{ path: '', redirectTo: '/application', pathMatch: 'full' },
	{ path: 'application', component: LandingComponent },
	{ path: 'co2_fps_dashboard', component: DTComponent },
	{ path: 'co2_t4_summary', component: SummaryComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { enableTracing: false, useHash: true })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
