import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SearchService {
	private currentT4Tab = new BehaviorSubject<string>('');
	getCurrentT4Tab$ = this.currentT4Tab.asObservable();

	constructor() {}

	setCurrentT4Tab(tab: string) {
		this.currentT4Tab.next(tab || '');
	}
}
