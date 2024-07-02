import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { HttpInterceptorProviders } from './shared/http-custom-interceptor/index';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { AppService } from './app.service';
import { Broadcaster } from './shared/broadcaster';
import { SidebarModule } from '@trax/sidebar';
import { HeaderbarComponent } from './shared/headerbar/headerbar.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { DTComponent } from './components/fps/datatable/datatable.component';
import { DataTableModule } from '@trax/datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';
import { RlTagInputModule } from 'angular2-tag-input';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './shared/landing/landing.component';
import { SummaryComponent } from './components/t4/summary/summary.component';

@NgModule({
	declarations: [AppComponent, HeaderbarComponent, LoaderComponent, DTComponent, LandingComponent, SummaryComponent],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		HttpModule,
		HttpClientModule,
		AppRoutingModule,
		SidebarModule,
		DataTableModule,
		NgSelectModule,
		ReactiveFormsModule,
		RlTagInputModule,
		CommonModule,
	],
	providers: [HttpInterceptorProviders, HttpClient, Broadcaster, AppService],
	bootstrap: [AppComponent],
})
export class AppModule {}
