import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DTComponent } from './components/fps/datatable/datatable.component';

const routes: Routes = [
	{ path: '', redirectTo: '/co2_fps_dashboard', pathMatch: 'full' },
	{ path: 'co2_fps_dashboard', component: DTComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { enableTracing: false, useHash: true })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
