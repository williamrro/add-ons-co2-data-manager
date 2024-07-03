import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummaryComponent } from './summary/summary.component';

const routes: Routes = [
	{ path: 'summary', component: SummaryComponent },
	{ path: '', redirectTo: 'summary', pathMatch: 'full' },
	{ path: '**', redirectTo: 'summary', pathMatch: 'full' },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class T4RoutingModule {}
