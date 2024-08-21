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
	hasT4Access: boolean = true;
	accessSub$: ISubscription;

	constructor(private router: Router, private authGuard: AuthGuard) {}

	ngOnInit() {
		this.accessSub$ = this.authGuard.getAccessInfo.subscribe((info: any) => {
			const { fpsAccess, t4Access } = info;
			this.hasFpsAccess = fpsAccess;
			this.hasT4Access = t4Access;
		});
	}

	onNavigate(isFps: boolean) {
		if (isFps) this.router.navigateByUrl('/fps');
		else this.router.navigateByUrl('/t4');
	}

	ngOnDestroy() {
		if (this.accessSub$) {
			this.accessSub$.unsubscribe();
		}
	}
}
