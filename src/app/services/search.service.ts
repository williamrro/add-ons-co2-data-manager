import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SearchService {
	private currentT4Tab = new BehaviorSubject<string>('');
	getCurrentT4Tab$ = this.currentT4Tab.asObservable();

	private searchParams = new BehaviorSubject<any>({});
	getSearchParams$ = this.searchParams.asObservable();

	constructor() {}

	setCurrentT4Tab(tab: string) {
		this.currentT4Tab.next(tab || '');
	}

	setSearchParams(params: any) {
		this.searchParams.next(params || {});
	}
}
