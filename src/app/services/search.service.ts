import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SearchService {
	private currentT4Tab = new BehaviorSubject<string>('');
	getCurrentT4Tab$ = this.currentT4Tab.asObservable();

	private userData = new BehaviorSubject<any>({ userId: '', clientCodes: [] });
	getUserData$ = this.userData.asObservable();

	private searchParams = new BehaviorSubject<any>({});
	getSearchParams$ = this.searchParams.asObservable();

	constructor() {}

	setCurrentT4Tab(tab: string) {
		this.currentT4Tab.next(tab || '');
	}

	setUserData(userId: string, clientCodes: string[]) {
		this.userData.next({ userId, clientCodes });
	}

	setSearchParams(params: any) {
		this.searchParams.next(params || {});
	}
}
