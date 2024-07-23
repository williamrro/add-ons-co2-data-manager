import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { SearchService } from '../../../services/search.service';

@Component({
	selector: 'app-intensity',
	templateUrl: './intensity.component.html',
	styleUrls: ['./intensity.component.scss'],
})
export class IntensityComponent implements OnInit {
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
