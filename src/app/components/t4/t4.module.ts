import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { T4RoutingModule } from './t4-routing.module';

import { SummaryComponent } from './summary/summary.component';
import { DetailComponent } from './detail/detail.component';
import { IntensityComponent } from './intensity/intensity.component';
import { TotalCo2Component } from './total-co2/total-co2.component';
import { ExceptionsComponent } from './exceptions/exceptions.component';

@NgModule({
	imports: [CommonModule, T4RoutingModule],
	declarations: [SummaryComponent, DetailComponent, IntensityComponent, TotalCo2Component, ExceptionsComponent],
})
export class T4Module {}
