import { Component, OnInit, Input, ViewEncapsulation } from "@angular/core";
import * as faker from "faker";
// import { EHOSTUNREACH } from "constants";
// import { APIService } from "./app.service";
import * as moment from "moment";
import { Date as webixDate } from "webix";
import { AppService } from "../app.service";
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: "app-datatable",
  templateUrl: "./datatable.component.html",
  // encapsulation: ViewEncapsulation.None,
  styleUrls: ["./datatable.component.scss"]
})
 export class DTComponent implements OnInit {
  modes : any;
  carrier : any;
  data = { action: '', payload: {} };
  myForm: FormGroup; 
  public rows: any;
  public columns: any = [];
  public tableOptions: any ;
  trackingNumTags: Array<any> = [];
  errorMsg : any ;
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
  'Last 7 days',
  'Last 30 days', 
  'Last 60 days', 
  'Last 90 days'
];
constructor(private appSerice: AppService, private fb: FormBuilder){

}
ngOnInit() {

  this.myForm = this.fb.group({
    platform : "FPS",
    client : "ABBVIE",
    shipDate : "Last 7 days",
    carrier : "ALL",
    mode : "ALL",
    trackingNumbers: [],
  });

  this.tableOptions = {
    isColumnFilterEnable: true,
    isColumnManagerEnable: true,
    isBulkEditEnable: false,
    bulkEdit: 'selected', // selected or all
    isAddEnable: false,
    isDeleteEnable: false,
    isEditEnable: false,
    isExportEnable: true,
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
        fillspace: true,
        editorColumn: true,
      },
      {
        id: 'clientCode',
        headerText: 'Client Code',
        type: 'string',
        default: true,
        minWidth: 100,
        fillspace: true,
        editorColumn: true,
      },
      {
        id: 'carrierCode',
        headerText: 'Carrier Code',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'carrierName',
        headerText: 'Carrier Name',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 110,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'region',
        headerText: 'Region',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 70,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'modeName',
        headerText: 'Mode',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 60,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'modeType',
        headerText: 'Mode Type',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'modeNorm',
        headerText: 'Mode Norm',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'service',
        headerText: 'Service',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 70,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'tempControl',
        headerText: 'Temp Control',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'shipDate',
        headerText: 'Ship Date',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 120,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'weightActualKG',
        headerText: 'Actual Weight',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
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

getTableDataOnCriteria() {
  this.appSerice.getTableDataOnCriteria(this.myForm.value).subscribe((res : any)  =>
    { 
        this.setRows(res);
    },
  );
}

setRows(configs) {
  this.rows = configs;
  console.log('all data configs', configs);
}

getOnSubmit() {
  console.log(this.myForm.value);
  console.log(this.myForm.value.platform);
  this.getTableDataOnCriteria();
}

onReset() {
  this.myForm = this.fb.group({
    platform : "FPS",
    client : "ABBVIE",
    shipDate : "Last 7 days",
    carrier : "ALL",
    mode : "ALL",
    trackingNumbers: [],
  });
}

tagAdded(event, key) {
  let tags = [];

  if (event.search(/\r?\n|\r/) != -1) {
    tags = event.split(/\r?\n|\r/);
  } else if (event.includes(" ")) {
    tags = event.split(" ");
  } else if (event.includes("\t")) {
    tags = event.split("\t");
  }

  if (tags.length) {
    this.trackingNumTags.forEach((trackingNumTag, index) => {
      if (trackingNumTag == event) {
        this.trackingNumTags.splice(index, 1);
        this.trackingNumTags = this.trackingNumTags.concat(tags);
      }
    });
  }
  this.errorMsg = "";
}
  focus(tag) {
    let item = tag.children[0].children[0].children[0];
    setTimeout(() => {
      item.focus();
    });
  }

  layoutChanges(event) {
   // this.loader = true;
    let insertObj = {
      layoutName: event.payload.name,
      columns: event.payload.columns.map((item) => {
        return item.id;
      }),
    };
  }
}