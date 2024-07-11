import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppService } from '../../../../app.service';
import { UtilService } from '../../../../services/util.service';

@Component({
	selector: 'app-search-form',
	templateUrl: './search-form.component.html',
	styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
	MULTI_SELECT_SETTINGS = {
		singleSelection: false,
		text: 'Select Values',
		selectAllText: 'Select All',
		unSelectAllText: 'UnSelect All',
		enableSearchFilter: true,
		badgeShowLimit: 1,
	};
	SINGLE_SELECT_SETTINGS = { ...this.MULTI_SELECT_SETTINGS, singleSelection: true };

	REQ_PAYLOAD: any = { platform: 'T4' };

	PREDEFINED_FILTERS: any = [
		{
			value: 'Client Code',
			key: 'client_code',
			required: true,
			multiSelect: false,
		},
	];

	filtersList: any[] = [];
	filterValues: any[] = [];

	searchForm: FormGroup = new FormGroup({});

	constructor(private router: Router, private appService: AppService, private utilService: UtilService) {}

	ngOnInit() {
		this.fetchCurrentFilters();
	}

	fetchCurrentFilters() {
		this.appService
			.getCurrentFilters()
			.pipe(
				finalize(() => {
					this.initializeForm();
				})
			)
			.subscribe((res: any) => {
				if (res && res.length > 0) {
					this.filtersList = [...this.PREDEFINED_FILTERS, ...res];
				}
			});
	}

	initializeForm() {
		const searchFormGroup: any = {};
		this.filtersList.forEach((item: any) => {
			searchFormGroup[item.key] = new FormControl('');
		});
		this.searchForm = new FormGroup(searchFormGroup);
	}

	onFilterOpen(filterKey: any) {
		this.filterValues = [];

		if (filterKey === 'client_code') this.fetchClientFilterValue();
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

	onSearch() {
		console.log(this.utilService.formatT4SearchPayload(this.searchForm.value));
	}
}
