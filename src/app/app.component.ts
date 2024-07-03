import { Component } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { Broadcaster } from './shared/broadcaster';

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

	constructor(private authGuard: AuthGuard, private broadcaster: Broadcaster) {}

	ngOnInit() {
		this.svgloaderB = this.broadcaster.on<string>('svgLoader').subscribe((isVisible: any) => {
			this.svgLoader = isVisible;
		});
		this.maskloaderB = this.broadcaster.on<boolean>('mask').subscribe((isMask: boolean) => {
			this.mask = isMask;
		});

		// // In case of authentication for FPS and T4 applications, use below code to set access
		// this.authGuard.setFpsAccess(true);
		// this.authGuard.setT4Access(false);
	}

	ngOnDestroy() {
		if (this.svgloaderB) {
			this.svgloaderB.unsubscribe();
		}
		if (this.maskloaderB) {
			this.maskloaderB.unsubscribe();
		}
	}
}
