import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: "app-datatable",
  templateUrl: "./datatable.component.html",
  // encapsulation: ViewEncapsulation.None,
  styleUrls: ["./datatable.component.scss"]
})
export class DTComponent implements OnInit {
  metadata: any;
  modes: any;
  carrier: any;
  data = { action: '', payload: {} };
  myForm: FormGroup;
  public rows: any;
  public columns: any = [];
  public tableOptions: any;
  trackingNumTags: Array<any> = [];
  errorMsg: any;

  clients = [
    'ABBVIE'
  ];
  plafForm = [
    'FPS'
  ];
  shipDate = [
    'Last 7 days',
    'Last 30 days',
    'Last 60 days',
    'Last 90 days'
  ];
  constructor(private appSerice: AppService, private fb: FormBuilder) {

  }
  ngOnInit() {

    // this.myForm = this.fb.group({
    //   platform : "FPS",
    //   client : "ABBVIE",
    //   shipDate : "Last 7 days",
    //   carrier : "ALL",
    //   mode : "ALL",
    //   trackingNumbers: [],
    // });
    this.onReset();

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
        default: false,
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
        default: false,
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
        default: false,
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
      {
        id: 'cO2ETTW',
        headerText: 'CO2ETTW',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'cO2UnitOfMeasure',
        headerText: 'CO2 Unit Of Measure',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'cO2TTW',
        headerText: 'CO2TTW',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'cO2WTW',
        headerText: 'CO2WTW',
        type: 'true',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'calculatedDistance',
        headerText: 'Calculated Distance',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'calculatedDistanceUOM',
        headerText: 'Calculated Distance UOM',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'classificationCode',
        headerText: 'Classification Code',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'classificationDescription',
        headerText: 'Classification Description',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'commodity',
        headerText: 'Commodity',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'compensationUSD',
        headerText: 'Compensation USD',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'confidenceScore',
        headerText: 'Confidence Score',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },


      {
        id: 'createdBy',
        headerText: 'Created By',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'createdDate',
        headerText: 'Created Date',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destAddr1',
        headerText: 'destination Address 1',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destAddr2',
        headerText: 'destination Address 2',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destAddr3',
        headerText: 'destination Address 3',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destAddr4',
        headerText: 'destination Address 4',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destCity',
        headerText: 'Destination City',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destCntry',
        headerText: 'Destination Cntry',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destPostCode',
        headerText: 'Destination Post Code',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destStateProv',
        headerText: 'Destination State Prov',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'destStateProv',
        headerText: 'Destination State Prov',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'isCalculated',
        headerText: 'Is Calculated',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'modifiedDate',
        headerText: 'Modified Date',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origAddr1',
        headerText: 'Origin Address 1',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origAddr2',
        headerText: 'Origin Address 2',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origAddr3',
        headerText: 'Origin Address 3',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origAddr4',
        headerText: 'Origin Address 4',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origCity',
        headerText: 'Origin City',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origCntry',
        headerText: 'Origin Cntry',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origPostCode',
        headerText: 'Origin Post Code',
        type: 'number',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'origStateProv',
        headerText: 'Origin State Prov',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'portOfDestination',
        headerText: 'Port Of Destination',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'portOfOrigin',
        headerText: 'Port Of Origin',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'reasonCode',
        headerText: 'Reason Code',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'reasonDescription',
        headerText: 'Reason Description',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'receivedDate',
        headerText: 'Received Date',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'region',
        headerText: 'Region',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'sIDOrFbID',
        headerText: 'SID or FBID',
        type: 'string',
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'serviceLevel',
        headerText: 'Service Level',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'shipmentDistance',
        headerText: 'Shipment Distance',
        type: 'number',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'shipmentDistanceQualifier',
        headerText: 'Shipment Distance Qualifier',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'transportModeType',
        headerText: 'Transport Mode Type',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'weightActual',
        headerText: 'weight Actual',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'weightActualKG',
        headerText: 'weight Actual KG',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'weightActualLB',
        headerText: 'weight Actual LB',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: 'weightQualifier',
        headerText: 'Weight Qualifier',
        type: 'string',
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
    ];
    this.getmetaData();
    this.getAllConfigs();
  }
  getmetaData() {
    this.appSerice.getmetaData(this.myForm.value).subscribe((res: any) => {
      if (res.status === "Success") {
        this.metadata = res.data;
        this.modes = this.metadata.mode;
        this.carrier = this.metadata.carrier;
        console.log(res);
      }

    })
  }

  selectedRows(data) {
    this.data = data;
    console.log('selected Rows', data);
  }


  getAllConfigs() {
    this.appSerice.getTableData(this.myForm.value).subscribe((res: any) => {
      this.setRows(res.data);
    },
    );
  }

  getTableDataOnCriteria() {
    this.appSerice.getTableDataOnCriteria(this.myForm.value).subscribe((res: any) => {
      this.setRows(res.data);
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
      platform: "FPS",
      client: "ABBVIE",
      shipDate: "Last 7 days",
      carrier: "ALL",
      mode: "ALL",
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

  // layoutChanges(event) {
  //  // this.loader = true;
  //   let insertObj = {
  //     layoutName: event.payload.name,
  //     columns: event.payload.columns.map((item) => {
  //       return item.id;
  //     }),
  //   };
  // }
}