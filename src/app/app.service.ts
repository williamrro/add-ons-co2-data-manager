import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Broadcaster } from './shared/broadcaster';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../environments/environment';

@Injectable()
export class AppService {
	private BASE_URL: string = environment.apiUrl;

	constructor(private http: HttpClient) {}

	getClients(obj: any) {
		return this.http.post(this.BASE_URL + 'co2emission/api/v1/clients', obj);
	}

	getmetaData(obj) {
		return this.http.post(this.BASE_URL + 'co2emission/api/metadata/getMetaData', obj);
	}

	getTableData(obj) {
		return this.http.post(this.BASE_URL + 'co2emission/api/metadata/getCo2Values', obj);
	}
	getTableDataOnCriteria(obj, offset) {
		return this.http.post(this.BASE_URL + 'co2emission/api/metadata/getCo2ValuesOnCriteria?offset=' + offset, obj);
	}

	reTrigger(obj) {
		return this.http.post(this.BASE_URL + 'co2emission/api/v1/calculateCo2EmissionByFbids', obj);
	}
	normalize(obj) {
		return this.http.post(this.BASE_URL + 'co2emission/api/v1/normalizeCo2EmissionByFbids', obj);
	}
}
