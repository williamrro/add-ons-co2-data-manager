import { Component, OnInit, Input, ViewEncapsulation } from "@angular/core";
import * as faker from "faker";
// import { EHOSTUNREACH } from "constants";
// import { APIService } from "./app.service";
import * as moment from "moment";
import { Date as webixDate } from "webix";
import { AppService } from "../app.service";

@Component({
  selector: "app-datatable",
  templateUrl: "./datatable.component.html",
  // encapsulation: ViewEncapsulation.None,
  styleUrls: ["./datatable.component.scss"]
})
 export class DTComponent implements OnInit {
//export class DTComponent {
  modes : any;
  carrier : any;
  data = { action: '', payload: {} };

  public rows: any;
  public columns: any = [];
  public tableOptions: any ;

  cars = [
    { id: 1, name: 'Volvo' },
    { id: 2, name: 'Saab' },
    { id: 3, name: 'Opel' },
    { id: 4, name: 'Audi' },
];

clients = [
  'ABBVIE'
];
plafForm =[
  'FPS'
];
shipDate = [
  'Last 7 days'
];
constructor(private appSerice: AppService){

}
ngOnInit() {
  this.tableOptions = {
    isColumnFilterEnable: true,
    isColumnManagerEnable: false,
    isBulkEditEnable: false,
    bulkEdit: 'selected', // selected or all
    isAddEnable: false,
    isDeleteEnable: false,
    isEditEnable: false,
    isExportEnable: false,
    hover: 'rowHover',
    idField: 'importId',
    filters: true,
    };
    this.columns = [
      {
        id: 'sourceSystem',
        headerText: 'Platform',
        type: 'string',
        default: true,
        minWidth: 90,
        fillspace: true
      },
      {
        id: 'clientCode',
        headerText: 'Client Code',
        type: 'string',
        default: true,
        minWidth: 10,
        fillspace: true
      },
      {
        id: 'carrierCode',
        headerText: 'Carrier Code',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true
      },
      {
        id: 'carrierName',
        headerText: 'Carrier Name',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 110,
        edit: true
      },
      {
        id: 'region',
        headerText: 'Region',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 70,
        edit: true
      },
      {
        id: 'modeName',
        headerText: 'Mode',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 50,
        edit: true
      },
      {
        id: 'modeType',
        headerText: 'Mode Type',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true
      },
      {
        id: 'modeNorm',
        headerText: 'Mode Norm',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true
      },
      {
        id: 'service',
        headerText: 'Service',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 70,
        edit: true
      },
      {
        id: 'tempControl',
        headerText: 'Temp Control',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 120,
        edit: true
      },
      {
        id: 'shipDate',
        headerText: 'Ship Date',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 50,
        edit: true
      },
      {
        id: 'weightActualKG',
        headerText: 'Actual Weight',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 50,
        edit: true
      },
    ];
   this.getmetaData();
    this.getAllConfigs();
}
getmetaData(){
  this.appSerice.getmetaData().subscribe((res : any)  =>
    { 
      this.modes = res.mode;
      this.carrier = res.carrier;
      console.log(res);
    })
}

selectedRows(data) {
  this.data = data;
  console.log('selected Rows', data);
}

buttonClickEvents(data) {
  console.log(data);
}

getAllConfigs() {
  this.appSerice.getTableData().subscribe((res : any)  =>
    { 
        this.setRows(res);
    },
  );
}

setRows(configs) {
  this.rows = configs;
  console.log('all data configs', configs);
}

}
