import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

import { T4RoutingModule } from './t4-routing.module';

import { T4Component } from './t4/t4.component';
import { SearchFormComponent } from './shared/search-form/search-form.component';
import { ManageFiltersComponent } from './shared/manage-filters/manage-filters.component';
import { SummaryComponent } from './summary/summary.component';
import { DetailComponent } from './detail/detail.component';
import { IntensityComponent } from './intensity/intensity.component';
import { TotalCo2Component } from './total-co2/total-co2.component';
import { ExceptionsComponent } from './exceptions/exceptions.component';

@NgModule({
	imports: [CommonModule, FormsModule, ReactiveFormsModule, T4RoutingModule, AngularMultiSelectModule],
	declarations: [
		T4Component,
		SearchFormComponent,
		ManageFiltersComponent,
		SummaryComponent,
		DetailComponent,
		IntensityComponent,
		TotalCo2Component,
		ExceptionsComponent,
	],
})
export class T4Module {}
