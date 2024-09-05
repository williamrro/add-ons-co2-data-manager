import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Broadcaster } from "./shared/broadcaster";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { environment } from "../environments/environment";

@Injectable()
export class AppService {
  private BASE_URL: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClients(obj: any) {
    return this.http.post(this.BASE_URL + "co2emission/api/v1/clients", obj);
  }

  getmetaData(obj) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/metadata/getMetaData",
      obj
    );
  }

  getTableData(obj) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/metadata/getCo2Values",
      obj
    );
  }
  getTableDataOnCriteria(obj, offset) {
    return this.http.post(
      this.BASE_URL +
        "co2emission/api/metadata/getCo2ValuesOnCriteria?offset=" +
        offset,
      obj
    );
  }

  reTrigger(obj) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/v1/calculateCo2EmissionByFbids",
      obj
    );
  }
  normalize(obj) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/v1/normalizeCo2EmissionByFbids",
      obj
    );
  }

  getT4Auth() {
    const reqUrl = `${this.BASE_URL}co2emission/api/auth`;
    return this.http.get(reqUrl).map((response) => {
      return response;
    });
  }

  getFiltersToDisplay(clientCode) {
    const reqUrl = `${this.BASE_URL}co2emission/api/filterColumns?clientCode=${clientCode}`;
    return this.http.get(reqUrl).map((response) => {
      return response;
    });

    // console.log('URL:', reqUrl);
    // return this.http.get('/assets/jsons/filtersToDisplay.json');
  }

  getFilterValues(
    filterKey: string,
    clientCode: string,
    token: string = "",
    searchText: string = "",
    filterType: string
  ) {
    // GET /api/filterColumns/<columnKey>/values?type=["standard" | "custom"]&token=""&clientCode="HPAX"&size=50
    const reqUrl = `${this.BASE_URL}co2emission/api/filterColumns/${filterKey}/values?type=${filterType}&clientCode=${clientCode}&token=${token}&searchText=${searchText}`;
    return this.http.get(reqUrl).map((response) => {
      return response;
    });

    // console.log('URL:', reqUrl);
    // if (filterKey.includes('customAttr')) return this.http.get(`/assets/jsons/filterValues.customAttr.json`);
    // else if (searchText) return this.http.get(`/assets/jsons/filterValues.${filterKey}20.json`);
    // return this.http.get(`/assets/jsons/filterValues.${filterKey}.json`);
  }

  getAllCustomFilters(clientCode: string) {
    const reqUrl = `${this.BASE_URL}co2emission/api/customFilters?clientCode=${clientCode}`;
    return this.http.get(reqUrl).map((response) => {
      return response;
    });

    // console.log('URL:', reqUrl);
    // return this.http.get('/assets/jsons/allFilters.json');
  }

  getAllSummaryYears() {
    const reqUrl = `${this.BASE_URL}co2emission/api/summary/years/4`;
    return this.http.get(reqUrl).map((response) => {
      return response;
    });
  }
  saveCustomFilters(reqPayload: any, clientCode: string) {
    return this.http.post(
      this.BASE_URL + `co2emission/api/customFilters?clientCode=${clientCode}`,
      reqPayload
    );
  }
  summaryTableInfo(reqPayload: any) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/summary/deltaInfo",
      reqPayload
    );
  }
  summaryGraph(reqPayload: any) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/summary/yoygraph",
      reqPayload
    );
  }
  detailModeGraph(reqPayload: any) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/detail/modeGraph",
      reqPayload
    );
  }
  detailCarrerGraph(reqPayload: any) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/detail/carrierGraph",
      reqPayload
    );
  }
  detailLaneGraph(reqPayload: any) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/detail/laneGraph",
      reqPayload
    );
  }
  exceptionsTableSummary(reqPayload: any) {
    return this.http.post(
      this.BASE_URL + "co2emission/api/exceptions/tableSummary",
      reqPayload
    );
  }
}
