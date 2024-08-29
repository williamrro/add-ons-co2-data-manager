import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { finalize, tap } from 'rxjs/operators';
import 'rxjs/add/operator/do';
import { Broadcaster } from '../broadcaster';

@Injectable()
export class HttpCustomInterceptor implements HttpInterceptor {
	constructor(private broadcaster: Broadcaster) {
		//Do nothing
	}

	private onGoingRequest: Array<any> = [];

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		//if(req && req.url && req.url.indexOf('/applicationanme/api/') != -1 && req.url.indexOf('ttsmconfig?param=side_menu') == -1) {
		// this.onGoingRequest.push(req.url.substr(req.url.lastIndexOf('/advisor')));
		this.onGoingRequest.push(req.url);
		setTimeout(() => this.broadcaster.broadcast('mask', true), 0);
		//}

		return next.handle(req).do(
			(event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					// let verifyURL = event.url.substr(event.url.lastIndexOf('/applicationname'));

					// if(this.onGoingRequest.indexOf(verifyURL) != -1) {
					//   this.onGoingRequest.splice(this.onGoingRequest.indexOf(verifyURL), 1);
					// }
					// (OR) BELOW
					this.onGoingRequest.splice(this.onGoingRequest.indexOf(event.url), 1);

					if (this.onGoingRequest.length <= 0) {
						setTimeout(() => this.broadcaster.broadcast('mask', false), 0);
					}
				}
			},
			(err: any) => {
				//In Error - Stop the loading mask
				console.log('Aw! Snap! Error:  ', err);
				setTimeout(() => this.broadcaster.broadcast('mask', false), 0);
				this.onGoingRequest = [];
			}
		);
	}
}
