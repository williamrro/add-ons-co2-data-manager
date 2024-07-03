import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { T4RoutingModule } from './t4-routing.module';

import { SummaryComponent } from './summary/summary.component';

@NgModule({
	imports: [CommonModule, T4RoutingModule],
	declarations: [SummaryComponent],
})
export class T4Module {}
