import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Broadcaster } from './shared/broadcaster';
import { ISubscription } from 'rxjs/Subscription';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	title = 'app';
	public rlink: any;
	public ractlink: any;
	public svgLoader: boolean = false;
	public mask: boolean = false;
	private svgloaderB: any;
	private maskloaderB: any;

	isT4User: boolean = false;
	routerSub$: ISubscription;

	constructor(private router: Router, private authGuard: AuthGuard, private broadcaster: Broadcaster) {}

	ngOnInit() {
		this.svgloaderB = this.broadcaster.on<string>('svgLoader').subscribe((isVisible: any) => {
			this.svgLoader = isVisible;
		});
		this.maskloaderB = this.broadcaster.on<boolean>('mask').subscribe((isMask: boolean) => {
			this.mask = isMask;
		});
		this.routerSub$ = this.router.events
			.filter((event) => event instanceof NavigationEnd)
			.subscribe((route: any) => {
				const { url = '' } = route || {};
				this.isT4User = url.includes('/t4');
			});

		// In case of authentication for FPS and T4 applications, use below code to set access (first param for FPS and second for T4)
		// this.authGuard.setAccessInfo(true, false);
	}

	ngOnDestroy() {
		if (this.svgloaderB) {
			this.svgloaderB.unsubscribe();
		}
		if (this.maskloaderB) {
			this.maskloaderB.unsubscribe();
		}
		if (this.routerSub$) {
			this.routerSub$.unsubscribe();
		}
	}
}
