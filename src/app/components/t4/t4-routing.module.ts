import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SummaryComponent } from './summary/summary.component';
import { DetailComponent } from './detail/detail.component';
import { IntensityComponent } from './intensity/intensity.component';
import { TotalCo2Component } from './total-co2/total-co2.component';
import { ExceptionsComponent } from './exceptions/exceptions.component';

const routes: Routes = [
	{ path: 'summary', component: SummaryComponent },
	{ path: 'detail', component: DetailComponent },
	{ path: 'intensity', component: IntensityComponent },
	{ path: 'total', component: TotalCo2Component },
	{ path: 'exceptions', component: ExceptionsComponent },
	{ path: '', redirectTo: 'summary', pathMatch: 'full' },
	{ path: '**', redirectTo: 'summary', pathMatch: 'full' },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class T4RoutingModule {}
