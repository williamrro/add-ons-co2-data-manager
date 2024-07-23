import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { SearchService } from '../../../services/search.service';

@Component({
	selector: 'app-detail',
	templateUrl: './detail.component.html',
	styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
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
