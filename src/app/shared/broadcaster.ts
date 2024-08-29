/**
 * @author   : Mel M (melvin@docnme.com)
 * @date     : 2018-09-21 00:00:00
 * @copyright: (c) 2016 Kanerika Software Pvt. Ltd.
 * @website  : http://kanerika.com/
 */

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

interface BroadcastEvent {
	key: any;
	data?: any;
}

export class Broadcaster {
	private _eventBus: Subject<BroadcastEvent>;

	constructor() {
		this._eventBus = new Subject<BroadcastEvent>();
	}

	broadcast(key: any, data?: any) {
		this._eventBus.next({ key, data });
	}

	on<T>(key: any): Observable<T> {
		return this._eventBus
			.asObservable()
			.filter((event) => event.key === key)
			.map((event) => <T>event.data);
	}
}
