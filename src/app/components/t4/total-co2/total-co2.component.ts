import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { SearchService } from '../../../services/search.service';

@Component({
	selector: 'app-total-co2',
	templateUrl: './total-co2.component.html',
	styleUrls: ['./total-co2.component.scss'],
})
export class TotalCo2Component implements OnInit {
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
