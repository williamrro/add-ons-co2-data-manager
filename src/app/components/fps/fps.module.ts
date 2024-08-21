import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DataTableModule } from '@trax/datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { RlTagInputModule } from 'angular2-tag-input';

import { FpsRoutingModule } from './fps-routing.module';

import { DTComponent } from './datatable/datatable.component';

@NgModule({
	imports: [CommonModule, ReactiveFormsModule, DataTableModule, NgSelectModule, RlTagInputModule, FpsRoutingModule],
	declarations: [DTComponent],
})
export class FpsModule {}
