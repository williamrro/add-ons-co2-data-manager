import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ISubscription } from 'rxjs/Subscription';
import { AuthGuard } from '../../../../guards/auth.guard';
import { AppService } from '../../../../app.service';
import { UtilService } from '../../../../services/util.service';

@Component({
	selector: 'app-search-form',
	templateUrl: './search-form.component.html',
	styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
	@HostBinding('class') class = 'autoFlexColumn';

	MULTI_SELECT_SETTINGS = {
		singleSelection: false,
		text: 'Select Values',
		selectAllText: 'Select All',
		unSelectAllText: 'UnSelect All',
		enableSearchFilter: true,
		badgeShowLimit: 1,
	};
	SINGLE_SELECT_SETTINGS = { ...this.MULTI_SELECT_SETTINGS, singleSelection: true };

	CLIENT_CODE_FILTER_KEY: string = 'client_code';
	REQ_PAYLOAD: any = { platform: 'T4' };
	PREDEFINED_FILTERS: any = [
		{
			label: 'Client Code',
			key: this.CLIENT_CODE_FILTER_KEY,
			singleSelect: true,
		},
	];

	hasFpsAccess: boolean = false;
	accessInfoSub$: ISubscription;

	standardFiltersList: any[] = [];
	customFiltersList: any[] = [];
	filterValues: any[] = [];

	searchForm: FormGroup = new FormGroup({});

	constructor(
		private router: Router,
		private authGuard: AuthGuard,
		private appService: AppService,
		private utilService: UtilService
	) {}

	ngOnInit() {
		this.accessInfoSub$ = this.authGuard.getAccessInfo.subscribe((info: any) => {
			this.hasFpsAccess = info && info.fpsAccess === true;
		});

		this.fetchFiltersToDisplay();
	}

	fetchFiltersToDisplay() {
		this.appService
			.getFiltersToDisplay()
			.pipe(
				finalize(() => {
					this.initializeForm();
				})
			)
			.subscribe((res: any) => {
				const { standardFilters = [], customFilters = [] } = res || {};
				this.standardFiltersList = [...this.PREDEFINED_FILTERS, ...standardFilters];
				this.customFiltersList = customFilters;
			});
	}

	initializeForm() {
		const { standardFiltersList, customFiltersList } = this;

		const searchFormGroup: any = {};
		[...standardFiltersList, ...customFiltersList].forEach((item: any) => {
			searchFormGroup[item.key] = new FormControl('');
		});
		this.searchForm = new FormGroup(searchFormGroup);
	}

	onFilterOpen(filterKey: any) {
		this.filterValues = [];

		if (filterKey === this.CLIENT_CODE_FILTER_KEY) this.fetchClientFilterValue();
		else this.fetchFilterValues(filterKey);
	}

	fetchClientFilterValue() {
		this.appService.getClients(this.REQ_PAYLOAD).subscribe((res: any) => {
			if (res && res.data && res.data.clients && res.data.clients.length > 0) {
				this.filterValues = this.utilService.formatValueForDropdown(res.data.clients);
			}
		});
	}

	fetchFilterValues(filterKey: string) {
		this.appService.getClients(this.REQ_PAYLOAD).subscribe((res: any) => {
			this.filterValues = this.utilService.formatValueForDropdown(['AAA', 'BBB']);
		});
	}

	onNavigate() {
		this.router.navigateByUrl('/fps');
	}

	onReset() {}

	onManageFilters() {}

	onSearch() {
		console.log(this.utilService.formatT4SearchPayload(this.searchForm.value));
	}

	ngOnDestroy() {
		if (this.accessInfoSub$) {
			this.accessInfoSub$.unsubscribe();
		}
	}
}
