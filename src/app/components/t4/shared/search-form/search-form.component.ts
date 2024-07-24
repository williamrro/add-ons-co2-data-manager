import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { ISubscription } from 'rxjs/Subscription';
import { AuthGuard } from '../../../../guards/auth.guard';
import { AppService } from '../../../../app.service';
import { UtilService } from '../../../../services/util.service';
import { SearchService } from '../../../../services/search.service';

@Component({
	selector: 'app-search-form',
	templateUrl: './search-form.component.html',
	styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
	@HostBinding('class') class = 'autoFlexColumn';

	MULTI_SELECT_SETTINGS = {
		text: 'Select Values',
		enableSearchFilter: true,
		lazyLoading: true,
		badgeShowLimit: 1,
		autoPosition: false,
	};
	SINGLE_SELECT_SETTINGS = { ...this.MULTI_SELECT_SETTINGS, singleSelection: true, showCheckbox: false };
	CLIENT_FILTER_SETTINGS = { ...this.SINGLE_SELECT_SETTINGS, lazyLoading: false, clearAll: false };

	INTENSITY_TAB: string = 'intensity';
	CLIENT_CODE_FILTER_KEY: string = 'clientCode';
	INTENSITY_FILTER_KEY: string = 'intensityMeasure';

	REQ_PAYLOAD: any = { platform: 'T4' };

	hasFpsAccess: boolean = false;
	accessInfoSub$: ISubscription;

	isIntensityTab: boolean = false;
	tabChangeSub$: ISubscription;

	userId: string = '';
	clientCodesList: any[] = [];
	userDataSub$: ISubscription;

	standardFiltersList: any[] = [];
	customFiltersList: any[] = [];
	isFilterValuesSearching: boolean = false;
	filterValues: any[] = [];
	filterValuesToken: string = '';
	filterValuesSearchText: string = '';
	filterSearchInput = new Subject<string>();

	searchForm: FormGroup = new FormGroup({});

	constructor(
		private router: Router,
		private authGuard: AuthGuard,
		private appService: AppService,
		private searchService: SearchService,
		private utilService: UtilService
	) {
		this.filterSearchInput.pipe(debounceTime(300)).subscribe((filterKey: string) => {
			this.clearFilterValuesAndToken();
			this.fetchFilterValues(filterKey, false);
		});
	}

	ngOnInit() {
		this.accessInfoSub$ = this.authGuard.getAccessInfo.subscribe((info: any) => {
			this.hasFpsAccess = info && info.fpsAccess === true;
		});

		this.tabChangeSub$ = this.searchService.getCurrentT4Tab$.subscribe((val: string) => {
			this.isIntensityTab = val === 'intensity';
		});

		this.userDataSub$ = this.searchService.getUserData$.subscribe((data: any) => {
			const { userId = '', clientCodes = [] } = data || {};

			if (userId && clientCodes && clientCodes.length > 0) {
				this.userId = userId;
				this.clientCodesList = this.utilService.formatValueForDropdown(clientCodes);

				this.fetchFiltersToDisplay();
			}
		});
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
				this.standardFiltersList = standardFilters;
				this.customFiltersList = customFilters;
			});
	}

	initializeForm() {
		const { clientCodesList, CLIENT_CODE_FILTER_KEY, standardFiltersList, customFiltersList } = this;
		const defaultClient = clientCodesList.length > 0 ? [clientCodesList[0]] : [];

		const searchFormGroup: any = {};
		searchFormGroup[CLIENT_CODE_FILTER_KEY] = new FormControl(defaultClient, Validators.required);
		[...standardFiltersList, ...customFiltersList].forEach((item: any) => {
			searchFormGroup[item.key] = new FormControl([]);
		});
		this.searchForm = new FormGroup(searchFormGroup);
	}

	clearFilterValuesAndToken() {
		this.filterValuesToken = '';
		this.filterValues = [];
	}

	/**
	 * Client code is always required and it is not supposed to be deSelected.
	 * But the library deSelects an option if user clicks on that option again (Library limitation).
	 * As a workaround, when an item is deSelected, the form value for client is updated again with the deSelected value.
	 * @param item - DeSelected item.
	 */
	onClientDeSelect(item: any) {
		this.searchForm.controls[this.CLIENT_CODE_FILTER_KEY].setValue([item]);
	}

	onFilterOpen() {
		this.clearFilterValuesAndToken();
		this.filterValuesSearchText = '';
	}

	onFilterValuesScrollToEnd(event: any, filterKey: string) {
		const { isFilterValuesSearching, filterValues, filterValuesToken } = this;
		const { startIndex, endIndex, scrollEndPosition } = event;

		// If no filter values API call is on-going & if filter is in opened state.
		if (!isFilterValuesSearching && scrollEndPosition > 0) {
			if (startIndex === -1) {
				// Fetch first set of values
				this.fetchFilterValues(filterKey, false);
			} else if (endIndex === filterValues.length - 1 && filterValuesToken) {
				// User scrolled to last item &  next page data is available
				this.fetchFilterValues(filterKey, true);
			}
		}
	}

	onFilterSearch(filterKey: string) {
		this.filterSearchInput.next(filterKey);
	}

	fetchFilterValues(filterKey: string, isLoadMore: boolean = false) {
		this.isFilterValuesSearching = true;

		const { searchForm, CLIENT_CODE_FILTER_KEY, filterValuesToken, filterValuesSearchText } = this;
		const clientCodeField = searchForm.value[CLIENT_CODE_FILTER_KEY];
		const userSelectedClientCode = clientCodeField.length > 0 ? clientCodeField[0][this.utilService.DROPDOWN_KEY] : '';

		this.appService
			.getFilterValues(filterKey, userSelectedClientCode, filterValuesToken, filterValuesSearchText)
			.pipe(
				finalize(() => {
					this.isFilterValuesSearching = false;
					this.utilService.resetDropdownPosition();
				})
			)
			.subscribe((res: any) => {
				const { data = [], token = '' } = res || {};
				const newFilterValues = this.utilService.formatValueForDropdown(data);
				this.filterValues = isLoadMore ? this.filterValues.concat(newFilterValues) : newFilterValues;
				this.filterValuesToken = token;
			});
	}

	onNavigate() {
		this.router.navigateByUrl('/fps');
	}

	onReset() {
		this.searchForm.reset();
	}

	onManageFilters() {}

	onSearch() {
		this.searchService.setSearchParams(this.utilService.formatT4SearchPayload(this.searchForm.value));
	}

	ngOnDestroy() {
		if (this.accessInfoSub$) this.accessInfoSub$.unsubscribe();
		if (this.tabChangeSub$) this.tabChangeSub$.unsubscribe();
		if (this.userDataSub$) this.userDataSub$.unsubscribe();
		if (this.filterSearchInput) this.filterSearchInput.complete();
	}
}
