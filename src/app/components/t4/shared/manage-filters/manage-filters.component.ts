import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AppService } from '../../../../app.service';
import { UtilService } from '../../../../services/util.service';
import { FadeInOut } from '../../../../animations/animations';

@Component({
	selector: 'app-manage-filters',
	animations: [FadeInOut],
	templateUrl: './manage-filters.component.html',
	styleUrls: ['./manage-filters.component.scss'],
})
export class ManageFiltersComponent implements OnInit {
	MAX_FILTERS_COUNT: number = 9;

	@Input() selectedClients: any[] = [];
	@Input() selectedFilters: any[] = [];

	@Output() refreshFilters = new EventEmitter();
	@Output() closePopup = new EventEmitter();

	allFilters: any[] = [];
	selectedFilterToManage: any[] = [];
	allFiltersToManage: any[] = [];
	hasError: boolean = false;

	constructor(private appService: AppService, private utilService: UtilService) {}

	ngOnInit() {
		const { selectedClients, utilService } = this;
		const clientCode =
			selectedClients && selectedClients.length > 0 ? selectedClients[0][utilService.DROPDOWN_KEY] : '';
		this.appService.getAllCustomFilters(clientCode).subscribe((resp: any) => {
			if (resp && resp.length > 0) {
				this.allFilters = resp;
				this.formatAllFiltersToManage();
			}
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		const { selectedFilters } = changes;
		if (selectedFilters) this.setFiltersToDisplay(selectedFilters.currentValue);
	}

	setFiltersToDisplay(selectedFilters: any[]) {
		this.selectedFilterToManage = JSON.parse(JSON.stringify(selectedFilters));
		this.formatAllFiltersToManage();
	}

	formatAllFiltersToManage() {
		this.allFiltersToManage = [...this.allFilters].map((filter: any) => {
			return {
				...filter,
				disabled: this.selectedFilterToManage.some((itm: any) => itm.key === filter.key),
			};
		});
	}

	clearError() {
		this.hasError = false;
	}

	onResetFilters() {
		this.clearError();
		this.setFiltersToDisplay(this.selectedFilters);
	}

	onSelectFilter(filter: any) {
		if (!filter.disabled) {
			if (this.selectedFilterToManage && this.selectedFilterToManage.length >= 9) this.hasError = true;
			else {
				this.clearError();
				this.selectedFilterToManage = this.selectedFilterToManage.concat(filter);
				this.formatAllFiltersToManage();
			}
		}
	}

	onDeSelectFilter(filterKey: string) {
		this.clearError();

		this.selectedFilterToManage = this.selectedFilterToManage.filter((itm: any) => itm.key !== filterKey);
		this.formatAllFiltersToManage();
	}

	onSave() {
		this.clearError();

		const reqPayload = this.selectedFilterToManage.map((itm: any) => itm.key);
		this.appService.saveCustomFilters(reqPayload).subscribe((resp: any) => {
			this.refreshFilters.emit();
		});
	}
}
