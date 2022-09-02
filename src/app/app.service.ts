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

    
    constructor( private http: HttpClient, private broadcaster: Broadcaster ) {
    }

    getmetaData(){
     return  this.http.get(this.BASE_URL+'co2emission/metadata/getMetaData');
    }

    getTableData(){
        return  this.http.get(this.BASE_URL+'co2emission/metadata/getCo2Values');
       }
}