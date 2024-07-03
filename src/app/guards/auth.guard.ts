import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad, Router, Route } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
	constructor(private router: Router) {}

	private hasFpsAccess: boolean = true;
	private fpsSource = new BehaviorSubject<any>(this.hasFpsAccess);
	checkFpsAccess = this.fpsSource.asObservable();

	private hasT4Access: boolean = true;
	private t4Source = new BehaviorSubject<any>(this.hasT4Access);
	checkT4Access = this.t4Source.asObservable();

	checkAccess(routeConfig: Route) {
		const { path = '' } = routeConfig || {};
		const { hasFpsAccess, hasT4Access } = this;

		if ((path === 'fps' && hasFpsAccess) || (path === 't4' && hasT4Access)) return true;
		this.router.navigateByUrl('/application');
		return false;
	}

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> | Promise<boolean> | boolean {
		return this.checkAccess(next ? next.routeConfig : {});
	}

	canLoad(routeConfig: Route): Observable<boolean> | Promise<boolean> | boolean {
		return this.checkAccess(routeConfig);
	}

	setFpsAccess(val: boolean) {
		this.hasFpsAccess = val;
		this.fpsSource.next(val);
	}

	setT4Access(val: boolean) {
		this.hasT4Access = val;
		this.t4Source.next(val);
	}
}
