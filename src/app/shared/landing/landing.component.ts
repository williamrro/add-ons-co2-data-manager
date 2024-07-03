import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.component.html',
	styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
	@HostBinding('class') class = 'autoFlexColumn';

	constructor(private router: Router) {}

	ngOnInit() {}

	onNavigate(isFps: boolean) {
		if (isFps) this.router.navigateByUrl('/fps');
		else this.router.navigateByUrl('/t4');
	}
}
