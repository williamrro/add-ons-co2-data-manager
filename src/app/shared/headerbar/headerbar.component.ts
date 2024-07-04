import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-headerbar',
	templateUrl: './headerbar.component.html',
	styleUrls: ['./headerbar.component.scss'],
})
export class HeaderbarComponent implements OnInit {
	@Input() isT4User: boolean = false;

	constructor() {}

	ngOnInit() {}
}
