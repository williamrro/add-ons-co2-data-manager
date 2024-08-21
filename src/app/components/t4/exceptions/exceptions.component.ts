import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { SearchService } from '../../../services/search.service';

@Component({
	selector: 'app-exceptions',
	templateUrl: './exceptions.component.html',
	styleUrls: ['./exceptions.component.scss'],
})
export class ExceptionsComponent implements OnInit {
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
