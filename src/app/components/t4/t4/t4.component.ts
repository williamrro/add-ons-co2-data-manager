import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
	selector: 'app-t4',
	templateUrl: './t4.component.html',
	styleUrls: ['./t4.component.scss'],
})
export class T4Component implements OnInit {
	@HostBinding('class') class = 'autoFlexColumn';

	constructor() {}

	ngOnInit() {}
}
