import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { HttpInterceptorProviders } from './shared/http-custom-interceptor/index';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { AuthGuard } from './guards/auth.guard';
import { AppService } from './app.service';
import { UtilService } from './services/util.service';
import { SearchService } from './services/search.service';
import { Broadcaster } from './shared/broadcaster';
import { SidebarModule } from '@trax/sidebar';
import { HeaderbarComponent } from './shared/headerbar/headerbar.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { DataTableModule } from '@trax/datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RlTagInputModule } from 'angular2-tag-input';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './shared/landing/landing.component';

@NgModule({
	declarations: [AppComponent, HeaderbarComponent, LoaderComponent, LandingComponent],
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		HttpModule,
		HttpClientModule,
		AppRoutingModule,
		SidebarModule,
		DataTableModule,
		NgSelectModule,
		AngularMultiSelectModule,
		FormsModule,
		ReactiveFormsModule,
		RlTagInputModule,
		CommonModule,
	],
	providers: [HttpInterceptorProviders, HttpClient, Broadcaster, AppService, UtilService, SearchService, AuthGuard],
	bootstrap: [AppComponent],
})
export class AppModule {}
