import { Component, HostBinding, OnInit } from '@angular/core';
import { AppService } from '../../../app.service';
import { SearchService } from '../../../services/search.service';

@Component({
	selector: 'app-t4',
	templateUrl: './t4.component.html',
	styleUrls: ['./t4.component.scss'],
})
export class T4Component implements OnInit {
	@HostBinding('class') class = 'autoFlexColumn';

	constructor(private appService: AppService, private searchService: SearchService) {}

	ngOnInit() {
		this.appService.getT4Auth().subscribe((resp: any) => {
			const { userId = '', assignedClients = [] } = resp || {};
			const sortedClientsList = assignedClients.sort();

			this.searchService.setUserData(userId, sortedClientsList);
		});
	}
}
