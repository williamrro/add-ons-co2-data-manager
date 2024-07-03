import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DTComponent } from './datatable/datatable.component';

const routes: Routes = [
	{ path: 'dashboard', component: DTComponent },
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{ path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class FpsRoutingModule {}
