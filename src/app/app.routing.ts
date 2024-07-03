import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './shared/landing/landing.component';

const routes: Routes = [
	{ path: 'application', component: LandingComponent },
	{
		path: 'fps',
		loadChildren: () => import('./components/fps/fps.module').then((m) => m.FpsModule),
	},
	{
		path: 't4',
		loadChildren: () => import('./components/t4/t4.module').then((m) => m.T4Module),
	},
	{ path: '', redirectTo: 'application', pathMatch: 'full' },
	{ path: '**', redirectTo: 'application', pathMatch: 'full' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { enableTracing: false, useHash: true })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
