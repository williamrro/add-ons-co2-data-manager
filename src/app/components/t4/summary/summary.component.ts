import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { SearchService } from '../../../services/search.service';

@Component({
	selector: 'app-summary',
	templateUrl: './summary.component.html',
	styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit {
	searchParamsChangeSub$: ISubscription;
	searchParams: any = {};

	constructor(private searchService: SearchService) {}

	ngOnInit() {
		this.searchParamsChangeSub$ = this.searchService.getSearchParams$.subscribe((params: any) => {
			this.searchParams = params || {};
		});
	}

	ngOnDestroy() {
		if (this.searchParamsChangeSub$) this.searchParamsChangeSub$.unsubscribe();
	}
}
