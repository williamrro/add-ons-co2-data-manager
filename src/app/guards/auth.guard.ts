import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Router, Route } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
	constructor(private router: Router) {}

	private accessInfo: any = { fpsAccess: <boolean>true, t4Access: <boolean>true };
	private accessInfoSource = new BehaviorSubject<any>(this.accessInfo);
	getAccessInfo = this.accessInfoSource.asObservable();

	checkAccess(routeConfig: Route) {
		const { path = '' } = routeConfig || {};
		const { fpsAccess, t4Access } = this.accessInfo;

		if ((path === 'fps' && fpsAccess) || (path === 't4' && t4Access)) return true;
		this.router.navigateByUrl('/application');
		return false;
	}

	canActivate(next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
		return this.checkAccess(next ? next.routeConfig : {});
	}

	canLoad(routeConfig: Route): Observable<boolean> | Promise<boolean> | boolean {
		return this.checkAccess(routeConfig);
	}

	setAccessInfo(fpsAccess: boolean, t4Access: boolean) {
		this.accessInfo = { fpsAccess, t4Access };
		this.accessInfoSource.next({ fpsAccess, t4Access });
	}
}
