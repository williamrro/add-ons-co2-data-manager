import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { AuthGuard } from '../../guards/auth.guard';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.component.html',
	styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
	@HostBinding('class') class = 'autoFlexColumn';

	hasFpsAccess: boolean = true;
	fpsAccessSub$: ISubscription;

	hasT4Access: boolean = true;
	t4AccessSub$: ISubscription;

	constructor(private router: Router, private authGuard: AuthGuard) {}

	ngOnInit() {
		this.fpsAccessSub$ = this.authGuard.checkFpsAccess.subscribe((val: boolean) => {
			this.hasFpsAccess = val;
		});
		this.t4AccessSub$ = this.authGuard.checkT4Access.subscribe((val: boolean) => {
			this.hasT4Access = val;
		});
	}

	onNavigate(isFps: boolean) {
		if (isFps) this.router.navigateByUrl('/fps');
		else this.router.navigateByUrl('/t4');
	}

	ngOnDestroy() {
		if (this.fpsAccessSub$) {
			this.fpsAccessSub$.unsubscribe();
		}
		if (this.t4AccessSub$) {
			this.t4AccessSub$.unsubscribe();
		}
	}
}
