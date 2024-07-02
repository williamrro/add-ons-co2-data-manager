import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DTComponent } from '../app/datatable/datatable.component';
import { environment } from '../environments/environment';

const routes: Routes = [
	// {
	//   path: "",
	//   component: DTComponent
	// },
	{ path: '', redirectTo: '/co2_ecm_ui', pathMatch: 'full' },
	{ path: 'co2_ecm_ui', component: DTComponent },
];

@NgModule({
	imports: [
		//RouterModule.forRoot(routes)
		RouterModule.forRoot(routes, { enableTracing: false, useHash: true }),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
