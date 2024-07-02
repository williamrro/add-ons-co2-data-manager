import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './shared/landing/landing.component';
import { DTComponent } from './components/fps/datatable/datatable.component';

const routes: Routes = [
	{ path: '', redirectTo: '/application', pathMatch: 'full' },
	{ path: 'application', component: LandingComponent },
	{ path: 'co2_fps_dashboard', component: DTComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { enableTracing: false, useHash: true })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
