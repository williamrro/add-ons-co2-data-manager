import { Component, OnInit } from "@angular/core";
import { AppService } from "../app.service";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-datatable",
  templateUrl: "./datatable.component.html",
  // encapsulation: ViewEncapsulation.None,
  styleUrls: ["./datatable.component.scss"]
})
export class DTComponent implements OnInit {
  metadata: any;
  modeNormValue:boolean=true;
  modeNameValue:boolean=true;
  errorMessage="";
  successMessage=""
  modes: any;
  carrier: any;
  data = { action: '', payload: {} };
  myForm: FormGroup;
  offset:any;
  nextPageAvailable:boolean;
  preventMultiScrool:boolean=false
  public rows: any;
  public columns: any = [];
  public tableOptions: any;
  trackingNumTags: Array<any> = [];
  errorMsg: any;
  buttons = [];
  selectedItems: any = [];
  clients = [];
  plafForm = [
    'FPS',
    'TTSM'
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
      idField: 'sidFbid',
      filters: true,
      multiselect: true,
      checkboxColumn: true,
    };
    this.buttons = [
      {
        id: 1,
        name: "Reprocess",
        type: "click",
        action: "retrigger"
      },

    ];
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
        id: 'sidFbid',
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
    this.onReset();
  }

  onClientChange() {
    this.getmetaData();
    this.getAllConfigs();
  }

  clearClientsList() {
    this.clients = [];
    this.myForm.controls.client.setValue("");
  }

  getClients() {
    this.clearClientsList();

    this.appSerice.getClients({"platform" : this.myForm.value.platform}).pipe(finalize(() => {
      this.onClientChange();
    })).subscribe((res: any) => {
      if(res && res.data && res.data.clients && res.data.clients.length > 0) {
        this.clients = res.data.clients;
        this.myForm.controls.client.setValue(res.data.clients[0]);
      }
    })
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

  selectedNormalizeRows() {
    var data =this.selectedItems;
    console.log(data);
    // this.data = data;
    let dataToSend = [];
    var sIDOrFbIDs ='';
    var modeNormArray=[];
    var modeNameArray=[];
    console.log(data);
     if(data.length > 0){
       console.log('selected Rows', data.length);
     for (let i = 0; i < data.length; i++) {
 
       console.log('first row data is ', data[i]);
 
       dataToSend.push(data[i]);
     
       if(i == 0){
         sIDOrFbIDs = data[i].sidFbid;
         modeNormArray.push(data[i].modeNorm);
         modeNameArray.push(data[i].modeName)
       }else{
         sIDOrFbIDs = sIDOrFbIDs+','+data[i].sidFbid;
         modeNormArray.push(data[i].modeNorm);
         modeNameArray.push(data[i].modeName)
      }
     }
      this.modeNormValue = modeNormArray.every(item => item === "");
     this.modeNameValue = !modeNameArray.includes("");
     if(this.modeNormValue && this.modeNameValue){
    let reqJson={
       fbids:sIDOrFbIDs,
       platform:this.myForm.value.platform
     }
    //  this.getAllConfigs1();
    
     this.appSerice.normalize(reqJson).subscribe((res: any) => {
       console.log('Response is', res);
       if(res.status == "Success"){
        this.onClientChange();
        this.successMessage= "Normalization completed Successfully";
        this.clearMassage();
       }
       else{
          this.errorMessage="System Error";
          this.clearMassage();
       }
     },
     );
    }
    else if(this.modeNormValue == false && this.modeNameValue == false){
      this.errorMessage = "Mode Norm must be Null And Mode should not be null for the selected record(s)"
    }
    else if(this.modeNormValue == false && this.modeNameValue){
     this.errorMessage=  "Mode Norm must be Null for the selected record(s)";
    }
    else if(this.modeNameValue == false && this.modeNormValue){
      this.errorMessage= "Mode should not be null for the selected record(s)";
        }
      this.clearMassage();
       
     }
   }
 clearMassage(){
  setTimeout((x => {
    this.errorMessage = "";
    this.successMessage=""
  }), 5000)
 }
  selectedRows(data) {
   console.log(data);
   // this.data = data;
   let dataToSend = [];
   var sIDOrFbIDs ='';
    if(data.payload.length > 0){
      console.log('selected Rows', data.payload.length);
    for (let i = 0; i < data.payload.length; i++) {

      console.log('first row data is ', data.payload[i]);

      dataToSend.push(data.payload[i]);
      if(i == 0){
        sIDOrFbIDs = data.payload[i].sidFbid;
      }else{
        sIDOrFbIDs = sIDOrFbIDs+','+data.payload[i].sidFbid;
      }
    }
    console.log('dataToSend', sIDOrFbIDs);
   let reqJson={
      fbids:sIDOrFbIDs,
      platform:this.myForm.value.platform
    }

    this.appSerice.reTrigger(reqJson).subscribe((res: any) => {
      console.log('Response is', res);
    },
    );

    }
  }


  getAllConfigs() {
    let newRes = null;
    this.appSerice.getTableData(this.myForm.value).pipe(finalize(() => {
      this.preventMultiScrool=true;
      this.setRows(newRes);
    })).subscribe((res: any) => {
      newRes = res;
    },
    );
  }

  getTableDataOnCriteria(eventType) {
    this.preventMultiScrool=true;
    let newRes = null;
    this.appSerice.getTableDataOnCriteria(this.myForm.value,this.offset).pipe(finalize(() => {
      this.nextPageAvailable = newRes ? newRes.nextPageAvailable : false;
      this.offset = newRes ? newRes.offset : this.offset;
      if(eventType=='infiniteScroll'){
                this.data = { action: 'append', payload: newRes };
            }
            else{
      this.setRows(newRes);
            }
    })).subscribe((res: any) => {
      newRes = res;
    },
    );
  }

  setRows(configs) {
    this.rows = configs && configs.data && configs.data.data && configs.data.data.length > 0 ? configs.data.data : [];
    console.log('all data configs', configs);
  }

  getOnSubmit() {
    console.log(this.myForm.value);
    console.log(this.myForm.value.platform);
    if(this.myForm.valid) {
      this.offset=0;
      this.getTableDataOnCriteria('initialLoad');
    } else {
      this.errorMessage="Client is required for search";
      this.clearMassage();
    }
  }
  changeFn(val) {
    console.log(val);
    this.getClients();
}
  onReset() {
    this.myForm = this.fb.group({
      platform: "FPS",
      client: new FormControl('', Validators.required),
      shipDate: "Last 7 days",
      carrier: "ALL",
      mode: "ALL",
      trackingNumbers: [],
    });
    this.changeFn(this.myForm.value.platform); // Trigger platform change event
  }

  buttonClickEvents(data) {
    // console.log(data);
    if (data.action === "retrigger") {
      let rows = {
        action: "retrigger",
        payload: data.rows
      };
      this.selectedRows(rows);
    }

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

  selectionEvents($event) {
    console.log($event);
    if ($event.type === 'selectedRows') {
      this.selectedItems = $event.payload;
      console.log(this.selectedItems);
    }
  }
  co2scrollEvents(event){
    this.preventMultiScrool=false;
    if (event.type == "scrollEnd" && event.status) {
      if (this.nextPageAvailable) {
        console.log(this.offset);
        this.getTableDataOnCriteria('infiniteScroll');
      }
     
    }
  }
}