import {
  Component,
  OnInit,
  ChangeDetectorRef,
  SimpleChanges,
} from "@angular/core";
import { ISubscription } from "rxjs/Subscription";
import { SearchService } from "../../../services/search.service";
import { FormGroup } from "@angular/forms";
import { AppService } from "../../../app.service";
import { Router } from "@angular/router";
declare var c3: any;
@Component({
  selector: "app-summary",
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.scss"],
})
export class SummaryComponent implements OnInit {
  searchParamsChangeSub$: ISubscription;
  searchParams: any = {};
  tabs = ["Graph", "Table"];
  currentTab = "Graph";
  data = { action: "", payload: {} };
  myForm: FormGroup;
  offset: any;
  nextPageAvailable: boolean;
  preventMultiScroll: boolean = false;
  preventFilterScroll: boolean = false;
  public rows: any;
  public columns: any = [];
  public tableOptions: any;
  buttons = [];
  currentYear: number = new Date().getFullYear();
  selectedYear2024: string = "2024";
  selectedYear2023: string = "2023";
  selectedYear: { [key: number]: number } = {};
  chartGenerated: boolean = false;
  tableDataLoaded: boolean = false;
  dataTypeOptions = ["Manifest", "Invoice"];
  clientCodesList: ["ABBVIE", "SMITHS DETECTION"];

  summaryYearData: any[];
  summaryTableData: any = [];
  summaryGraphData: any = [];
  maxValue: number;
  chart: any;
  constructor(
    private searchService: SearchService,
    private appService: AppService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedYear[this.currentYear] = this.currentYear;
    this.selectedYear[this.currentYear - 1] = this.currentYear - 1;
    const currentUrl = this.router.url;
    const pathToMatch = "/t4/summary";
    this.searchParamsChangeSub$ = this.searchService.getSearchParams$.subscribe(
      (params: any) => {
        this.searchParams = params || {};
        if (
          Object.keys(this.searchParams).length &&
          currentUrl === pathToMatch
        ) {
          this.summaryApiData();
          this.summaryGraphFunction();
        }
      }
    );
    this.columns = [
      {
        id: "sourceSystem",
        headerText: "Platform",
        type: "string",
        default: false,
        minWidth: 90,
        fillspace: true,
        editorColumn: true,
      },
      {
        id: "clientCode",
        headerText: "Client Code",
        type: "string",
        default: true,
        minWidth: 100,
        fillspace: true,
        editorColumn: true,
      },
      {
        id: "carrierCode",
        headerText: "Carrier Code",
        type: "string",
        fillspace: true,
        default: true,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
      {
        id: "carrierName",
        headerText: "Carrier Name",
        type: "string",
        fillspace: true,
        default: false,
        minWidth: 110,
        edit: true,
        editorColumn: true,
      },
      {
        id: "region",
        headerText: "Region",
        type: "string",
        fillspace: true,
        default: true,
        minWidth: 70,
        edit: true,
        editorColumn: true,
      },
      {
        id: "modeName",
        headerText: "Mode",
        type: "string",
        fillspace: true,
        default: true,
        minWidth: 60,
        edit: true,
        editorColumn: true,
      },
      {
        id: "modeType",
        headerText: "Mode Type",
        type: "string",
        fillspace: true,
        default: false,
        minWidth: 100,
        edit: true,
        editorColumn: true,
      },
    ];
    this.tableOptions = {
      headerRowHeight: 39,
      rowHeight: 40,
      columnWidth: 230,
      tooltip: true,
      borderless: true,
      dragColumn: true,
      resizeColumn: true,
      editable: false,
      select: true,
      fillspace: true,
      checkboxColumn: true,
      isColumnManagerEnable: false,
      isBulkEditEnable: false,
      isAddEnable: false,
      isEditEnable: false,
      isDeleteEnable: false,
      isExportEnable: true,
      serverSideFiltering: false,
      disableSelection: false,
    };
    this.appService.getAllSummaryYears().subscribe((res: any) => {
      this.summaryYearData = res;
    });
    this.searchService.setTabData(true);
  }

  summaryYear(data, i) {
    this.summaryApiData(data, i);
  }
  summaryApiData(data?, item?) {
    const obj = {
      basePeriod:
        item && item["PERIOD"] === "Base Period" ? Number(data) : 2023,
      currentPeriod:
        item && item["PERIOD"] === "Current Period" ? Number(data) : 2024,
      standardFilters: this.searchParams.searchStandardFormGroup,
      customFilters: this.searchParams.searchCustomFormGroup1,
    };

    this.appService.summaryTableInfo(obj).subscribe((res: any) => {
      if (res) {
        this.summaryTableData = res.table_data;
      }
    });
  }
  ngAfterViewInit() {
    this.summaryGraphFunction(); // Initialize chart after view is loaded
  }
  summaryGraphFunction() {
    const obj = {
      standardFilters: this.searchParams.searchStandardFormGroup,
      customFilters: this.searchParams.searchCustomFormGroup1,
    };
    this.summaryGraphData = [];
    this.appService.summaryGraph(obj).subscribe((res: any) => {
      if (res) {
        this.summaryGraphData = res.data;
        this.generateChart(
          this.summaryGraphData,
          this.searchParams.searchStandardFormGroup.showBy[0]
        );
        this.chartGenerated = true;
        this.cdr.detectChanges(); // Trigger change detection
      }
    });
  }
  // Debounce helper function
  debounce(fn, delay) {
    let timeoutID;
    return function (...args) {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(() => fn.apply(this, args), delay);
    };
  }
  showVerticalBar(d) {
    const xIndex = d.index; // Get the index of the hovered point
    this.chart.regions.remove();
    this.chart.regions.add({
      axis: "x",
      start: xIndex - 0.4, // Start the region before the data point
      end: xIndex + 0.4, // End the region after the data point
      class: "hover-bar", // Add a custom class for styling
    });
  }

  removeVerticalBar() {
    this.chart.regions.remove({ classes: ["hover-bar"] }); // Remove the region with the class 'hover-bar'
  }
  generateChart(data, showValue?) {
    setTimeout(() => {
      // Flatten and extract all numeric values from the dataset
      const allValues = data
        .map((dataset) => dataset.slice(1)) // Exclude the labels (first column)
        .reduce((acc, val) => acc.concat(val), []); // Flatten the arrays
      const numericValues = allValues.map((value) => Number(value));
      const rawMaxValue = Math.max(...numericValues);
      const ranges = [
        { max: 50, step: 5 },
        { max: 100, step: 10 },
        { max: 300, step: 20 },
        { max: 600, step: 50 },
        { max: 1000, step: 100 },
        { max: 2000, step: 200 },
        { max: 6000, step: 500 },
        { max: 20000, step: 1000 },
        { max: 30000, step: 2000 },
        { max: 60000, step: 5000 },
        { max: 100000, step: 10000 },
      ];
      const defaultStep = 5000; // Default step for very large ranges
      let step = defaultStep;
      for (const range of ranges) {
        if (rawMaxValue <= range.max) {
          step = range.step;
          break;
        }
      }
      if (rawMaxValue > 100000) {
        step = 20000; // Use this step for values above 100000
      }
      const maxYValue = Math.ceil(rawMaxValue / step) * step;
      const alternateLines = [];
      // Alternate gridlines (step * 2 for more sparse lines)
      for (let i = 0; i <= maxYValue; i += step * 2) {
        alternateLines.push({
          value: i,
          text: "",
          class: i === 0 ? "hidden-line" : `alternate-grid-line-${i}`,
        });
      }
      alternateLines.push({
        value: 0,
        text: "",
        class: "alternate-grid-line-0 hidden-line",
      });
      console.log(alternateLines);
      let yAxisLabel = showValue;
      // Generate the C3 chart
      this.chart = c3.generate({
        bindto: "#yoy-chart",
        data: {
          columns: data,
          type: "line",
          colors: {
            "2021": "#F48E16", // Orange
            "2022": "#D5AA0D", // Yellow
            "2023": "#24A756", // Green
            "2024": "#5C98F3", // Blue
          },
        },
        axis: {
          x: {
            type: "category",
            categories: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            tick: { multiline: false },
            height: 60,
          },
          y: {
            min: 0,
            max: maxYValue,
            padding: { top: 5, bottom: 20 },
            tick: {
              values: Array.from(
                { length: maxYValue / step + 1 },
                (_, i) => i * step
              ),
              format: function (d) {
                return rawMaxValue >= 100000
                  ? d / 100000 + "L"
                  : d / 1000 + "k";
              },
            },
            label: {
              text: yAxisLabel, // Label for the Y-axis
              position: "outer-middle" // Position of the label
            },
          },
        },
        grid: {
          y: {
            show: false,
            lines: alternateLines, // Combine both regular and alternate gridlines
          },
        },
        legend: { show: false },
        tooltip: {
          grouped: true, // To group the values in the tooltip
          format: {
            title: function (d) {
              return "Data for " + d;
            }, // Customize title in tooltip
            value: function (value, ratio, id) {
              return value; // Ensure values are displayed as decimals
            },
          },
          contents: function (
            d,
            defaultTitleFormat,
            defaultValueFormat,
            color
          ) {
            var html = "<div class='custom-tooltip'><table>";
            d.forEach(function (data) {
              html +=
                "<tr><td><span style='color:" +
                "#989898" +
                "'></span> " +
                data.name +
                ": </td>";
              html +=
                "<td style='font-weight:bold;'>" +
                (data.value !== null ? data.value : "0") +
                "</td></tr>";
            });
            html += "</table></div>";
            return html;
          },
        },
        interaction: {
          enabled: true, // Enable hover interaction
          highlight: {
            point: true, // Highlight points when hovered
          },
        },
        focus: {
          enabled: false, // Enable focus on specific regions when hovered
        },
        // grid: {
        //   y: {
        //     show: false, // Disable the horizontal gridlines on the y-axis
        //   },
        //   focus: {
        //     show: false, // Disable the vertical gridlines on hover
        //   },
        // },
        regions: [
          // This is an initial empty region. The region is dynamically updated when hovered.
        ],
      });
      this.insertCustomLegend();
    }, 0);
  }

  insertCustomLegend() {
    const legendContainer = document.querySelector("#yoy-chart-legend");

    // Check if the legend container is found
    if (!legendContainer) {
      return; // Exit the function if the element is not found
    }
    // Clear previous legends if any
    legendContainer.innerHTML = "";

    // Create custom legend manually
    const legendData = this.chart
      .data()
      .map((d) => {
        return `<span class="legend-item">
                <span style="background-color:${this.chart.color(
                  d.id
                )};" class="legend-color"></span>
                ${d.id}
              </span>`;
      })
      .join(" ");

    // Append the generated legend HTML to the container
    legendContainer.innerHTML = legendData;
  }

  initializeTableData() {
    let newRes = {
      data: [
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR",
          sidFbid: "FBLLABBV980003666270054",
          carrierName: "FEDEX EXPRESS",
          active_ref: "2023",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220599",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "KENNETH R MIRKIN MD",
          destAddr2: "NONE",
          destAddr3: "3028 JAVIER RD STE 500",
          destAddr4: "NONE",
          destCity: "FAIRFAX",
          destStateProv: "VA",
          destPostCode: "22031",
          destCntry: "US",
          cO2TTW: "10.180000305175781",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "10.319999694824219",
          cO2WTW: "12.890000343322754",
          compensationUSD: "0.32928",
          calculatedDistance: "1086.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "11.90196761",
          ops: "10.13748339",
          ene: "1.76448421",
          totEI: "1271.66398086",
          tkm: "9.3593652",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          active_ref: "2024",
          sidFbid: "FBLLABBV980003666270053",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "0.45359293",
          weightActualLB: "1.0",
          weightActual: "1.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002219836",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "DAKOTA DRUG INC",
          destAddr2: "NONE",
          destAddr3: "4121 12TH AVE N",
          destAddr4: "NONE",
          destCity: "FARGO",
          destStateProv: "ND",
          destPostCode: "58102",
          destCntry: "US",
          cO2TTW: "0.550000011920929",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "0.5600000023841858",
          cO2WTW: "0.699999988079071",
          compensationUSD: "0.01792",
          calculatedDistance: "961.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "0.64747051",
          ops: "0.54302484",
          ene: "0.10444566",
          totEI: "1485.65958948",
          tkm: "0.4358135",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270052",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          active_ref: "",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "9.071858",
          weightActualLB: "20.0",
          weightActual: "20.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220882",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "CHRISTINE NICOLE GIULIANI NP",
          destAddr2: "NONE",
          destAddr3: "8775 E ORCHARD RD STE 815",
          destAddr4: "NONE",
          destCity: "ENGLEWOOD",
          destStateProv: "CO",
          destPostCode: "80111",
          destCntry: "US",
          cO2TTW: "12.039999961853027",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "12.1899995803833",
          cO2WTW: "15.210000038146973",
          compensationUSD: "0.39004",
          calculatedDistance: "1552.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "14.07943976",
          ops: "12.00050891",
          ene: "2.07893086",
          totEI: "1000.00043762",
          tkm: "14.0794336",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          active_ref: "",
          sidFbid: "FBLLABBV980003666270051",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "1.3607788",
          weightActualLB: "3.0",
          weightActual: "3.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220549",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "SMITH DRUG COMPANY",
          destAddr2: "J M SMITH CORPORATION",
          destAddr3: "9098 FAIRFOREST RD",
          destAddr4: "NONE",
          destCity: "SPARTANBURG",
          destStateProv: "SC",
          destPostCode: "29301",
          destCntry: "US",
          cO2TTW: "1.6100000143051147",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "1.6399999856948853",
          cO2WTW: "2.0399999618530273",
          compensationUSD: "0.05208",
          calculatedDistance: "1074.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "1.88241481",
          ops: "1.60907587",
          ene: "0.27333894",
          totEI: "1288.09728582",
          tkm: "1.4613918",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          active_ref: "",
          sidFbid: "FBLLABBV980003666270050",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220883",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "SHILEN V LAKHANI MD",
          destAddr2: "THE GASTRNTRLGY GROUP PC",
          destAddr3: "1939 ROLAND CLARKE PL STE 200",
          destAddr4: "NONE",
          destCity: "RESTON",
          destStateProv: "VA",
          destPostCode: "20191",
          destCntry: "US",
          cO2TTW: "10.289999961853027",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "10.420000076293945",
          cO2WTW: "13.020000457763672",
          compensationUSD: "0.33264",
          calculatedDistance: "1053.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "12.02196761",
          ops: "10.24748339",
          ene: "1.77448421",
          totEI: "1324.73989029",
          tkm: "9.0749646",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          active_ref: "",
          sidFbid: "FBLLABBV980003666270049",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220858",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "MNGI NE INFUSION CENTER",
          destAddr2: "MICHELLE SAMAHA KENNEDY MD",
          destAddr3: "3001 BROADWAY ST NE STE120",
          destAddr4: "NONE",
          destCity: "MINNEAPOLIS",
          destStateProv: "MN",
          destPostCode: "55413",
          destCntry: "US",
          cO2TTW: "9.149999618530273",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "9.270000457763672",
          cO2WTW: "11.609999656677246",
          compensationUSD: "0.29568",
          calculatedDistance: "605.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "10.70196761",
          ops: "9.10748339",
          ene: "1.59448421",
          totEI: "2052.54028206",
          tkm: "5.214011",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          active_ref: "",
          sidFbid: "FBLLABBV980003666270048",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "1.8143717",
          weightActualLB: "4.0",
          weightActual: "4.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002219717",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "AMERISOURCEBERGEN DRUG CORP",
          destAddr2: "NONE",
          destAddr3: "108 ROUTE 17K STE 1",
          destAddr4: "NONE",
          destCity: "NEWBURGH",
          destStateProv: "NY",
          destPostCode: "12550",
          destCntry: "US",
          cO2TTW: "2.1600000858306885",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "2.180000066757202",
          cO2WTW: "2.7300000190734863",
          compensationUSD: "0.06972",
          calculatedDistance: "1236.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "2.51988696",
          ops: "2.14210138",
          ene: "0.37778558",
          totEI: "1123.70804073",
          tkm: "2.2424748",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          active_ref: "",
          sidFbid: "FBLLABBV980003666270047",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "9.525452",
          weightActualLB: "21.0",
          weightActual: "21.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002219717",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "AMERISOURCEBERGEN DRUG CORP",
          destAddr2: "NONE",
          destAddr3: "108 ROUTE 17K STE 1",
          destAddr4: "NONE",
          destCity: "NEWBURGH",
          destStateProv: "NY",
          destPostCode: "12550",
          destCntry: "US",
          cO2TTW: "11.319999694824219",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "11.460000038146973",
          cO2WTW: "14.319999694824219",
          compensationUSD: "0.36596",
          calculatedDistance: "1236.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "13.22691191",
          ops: "11.27353442",
          ene: "1.9533775",
          totEI: "1123.45781215",
          tkm: "11.7733944",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR",
          sidFbid: "FBLLABBV980003666270054",
          carrierName: "FEDEX EXPRESS",
          active_ref: "2023",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220599",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "KENNETH R MIRKIN MD",
          destAddr2: "NONE",
          destAddr3: "3028 JAVIER RD STE 500",
          destAddr4: "NONE",
          destCity: "FAIRFAX",
          destStateProv: "VA",
          destPostCode: "22031",
          destCntry: "US",
          cO2TTW: "10.180000305175781",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "10.319999694824219",
          cO2WTW: "12.890000343322754",
          compensationUSD: "0.32928",
          calculatedDistance: "1086.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "11.90196761",
          ops: "10.13748339",
          ene: "1.76448421",
          totEI: "1271.66398086",
          tkm: "9.3593652",
          status: "SUCCESS",
        },
      ],
      message: "",
      nextPageAvailable: true,
      offset: 1000,
      responseCode: 0,
      status: "Success",
    };
    this.nextPageAvailable = newRes ? newRes.nextPageAvailable : false;
    this.offset = newRes ? newRes.offset : this.offset;
    this.data = { action: "append", payload: newRes.data };
    this.setRows(newRes);
  }
  getTableDataOnCriteria(eventType) {
    let newRes = {
      data: [
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270054",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          active_ref: "Y",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220599",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "KENNETH R MIRKIN MD",
          destAddr2: "NONE",
          destAddr3: "3028 JAVIER RD STE 500",
          destAddr4: "NONE",
          destCity: "FAIRFAX",
          destStateProv: "VA",
          destPostCode: "22031",
          destCntry: "US",
          cO2TTW: "10.180000305175781",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "10.319999694824219",
          cO2WTW: "12.890000343322754",
          compensationUSD: "0.32928",
          calculatedDistance: "1086.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "11.90196761",
          ops: "10.13748339",
          ene: "1.76448421",
          totEI: "1271.66398086",
          tkm: "9.3593652",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270053",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          active_ref: "N",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "0.45359293",
          weightActualLB: "1.0",
          weightActual: "1.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002219836",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "DAKOTA DRUG INC",
          destAddr2: "NONE",
          destAddr3: "4121 12TH AVE N",
          destAddr4: "NONE",
          destCity: "FARGO",
          destStateProv: "ND",
          destPostCode: "58102",
          destCntry: "US",
          cO2TTW: "0.550000011920929",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "0.5600000023841858",
          cO2WTW: "0.699999988079071",
          compensationUSD: "0.01792",
          calculatedDistance: "961.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "0.64747051",
          ops: "0.54302484",
          ene: "0.10444566",
          totEI: "1485.65958948",
          tkm: "0.4358135",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270052",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          //   active_ref:"Y",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "9.071858",
          weightActualLB: "20.0",
          weightActual: "20.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220882",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "CHRISTINE NICOLE GIULIANI NP",
          destAddr2: "NONE",
          destAddr3: "8775 E ORCHARD RD STE 815",
          destAddr4: "NONE",
          destCity: "ENGLEWOOD",
          destStateProv: "CO",
          destPostCode: "80111",
          destCntry: "US",
          cO2TTW: "12.039999961853027",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "12.1899995803833",
          cO2WTW: "15.210000038146973",
          compensationUSD: "0.39004",
          calculatedDistance: "1552.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "14.07943976",
          ops: "12.00050891",
          ene: "2.07893086",
          totEI: "1000.00043762",
          tkm: "14.0794336",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270051",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          //   active_ref:"N",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "1.3607788",
          weightActualLB: "3.0",
          weightActual: "3.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220549",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "SMITH DRUG COMPANY",
          destAddr2: "J M SMITH CORPORATION",
          destAddr3: "9098 FAIRFOREST RD",
          destAddr4: "NONE",
          destCity: "SPARTANBURG",
          destStateProv: "SC",
          destPostCode: "29301",
          destCntry: "US",
          cO2TTW: "1.6100000143051147",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "1.6399999856948853",
          cO2WTW: "2.0399999618530273",
          compensationUSD: "0.05208",
          calculatedDistance: "1074.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "1.88241481",
          ops: "1.60907587",
          ene: "0.27333894",
          totEI: "1288.09728582",
          tkm: "1.4613918",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270050",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          //   active_ref:"Y",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220883",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "SHILEN V LAKHANI MD",
          destAddr2: "THE GASTRNTRLGY GROUP PC",
          destAddr3: "1939 ROLAND CLARKE PL STE 200",
          destAddr4: "NONE",
          destCity: "RESTON",
          destStateProv: "VA",
          destPostCode: "20191",
          destCntry: "US",
          cO2TTW: "10.289999961853027",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "10.420000076293945",
          cO2WTW: "13.020000457763672",
          compensationUSD: "0.33264",
          calculatedDistance: "1053.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "12.02196761",
          ops: "10.24748339",
          ene: "1.77448421",
          totEI: "1324.73989029",
          tkm: "9.0749646",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270049",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          //   active_ref:"Y",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX PRIORITY OVERNIGHT",
          serviceLevel: "FEDEX PRIORITY OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "8.618266",
          weightActualLB: "19.0",
          weightActual: "19.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002220858",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "MNGI NE INFUSION CENTER",
          destAddr2: "MICHELLE SAMAHA KENNEDY MD",
          destAddr3: "3001 BROADWAY ST NE STE120",
          destAddr4: "NONE",
          destCity: "MINNEAPOLIS",
          destStateProv: "MN",
          destPostCode: "55413",
          destCntry: "US",
          cO2TTW: "9.149999618530273",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "9.270000457763672",
          cO2WTW: "11.609999656677246",
          compensationUSD: "0.29568",
          calculatedDistance: "605.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "10.70196761",
          ops: "9.10748339",
          ene: "1.59448421",
          totEI: "2052.54028206",
          tkm: "5.214011",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          //   active_ref:"Y",
          sidFbid: "FBLLABBV980003666270048",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "1.8143717",
          weightActualLB: "4.0",
          weightActual: "4.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002219717",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "AMERISOURCEBERGEN DRUG CORP",
          destAddr2: "NONE",
          destAddr3: "108 ROUTE 17K STE 1",
          destAddr4: "NONE",
          destCity: "NEWBURGH",
          destStateProv: "NY",
          destPostCode: "12550",
          destCntry: "US",
          cO2TTW: "2.1600000858306885",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "2.180000066757202",
          cO2WTW: "2.7300000190734863",
          compensationUSD: "0.06972",
          calculatedDistance: "1236.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "2.51988696",
          ops: "2.14210138",
          ene: "0.37778558",
          totEI: "1123.70804073",
          tkm: "2.2424748",
          status: "SUCCESS",
        },
        {
          sourceSystem: "FPS",
          clientCode: "ABBVIE",
          region: "AMR.US",
          sidFbid: "FBLLABBV980003666270047",
          carrierName: "FEDEX EXPRESS",
          carrierCode: "FDE",
          modeName: "AIR",
          modeType: "PARCEL",
          //   active_ref:"Y",
          modeNorm: "AIR",
          transportModeType: "",
          service: "FEDEX STANDARD OVERNIGHT",
          serviceLevel: "FEDEX STANDARD OVERNIGHT",
          tempControl: "YES",
          shipDate: "2024-06-07T12:09:40.110+00:00",
          receivedDate: "2024-06-17T12:07:15.277+00:00",
          commodity: "",
          shipmentDistance: "0.0",
          shipmentDistanceQualifier: "NONE",
          weightActualKG: "9.525452",
          weightActualLB: "21.0",
          weightActual: "21.0",
          weightQualifier: "LB",
          origAddr1: "ABBVIE/AP-5",
          origAddr2: "SHIPPING DEPARTMENT 0002219717",
          origAddr3: "1 N WAUKEGAN RD APT 5",
          origAddr4: "NONE",
          origCity: "INGLESIDE",
          origStateProv: "IL",
          origPostCode: "60041",
          origCntry: "US",
          destAddr1: "AMERISOURCEBERGEN DRUG CORP",
          destAddr2: "NONE",
          destAddr3: "108 ROUTE 17K STE 1",
          destAddr4: "NONE",
          destCity: "NEWBURGH",
          destStateProv: "NY",
          destPostCode: "12550",
          destCntry: "US",
          cO2TTW: "11.319999694824219",
          cO2UnitOfMeasure: "kg",
          cO2ETTW: "11.460000038146973",
          cO2WTW: "14.319999694824219",
          compensationUSD: "0.36596",
          calculatedDistance: "1236.0",
          calculatedDistanceUOM: "km",
          classificationCode: "",
          classificationDescription: "",
          confidenceScore: "3",
          reasonCode: "",
          reasonDescription: "",
          isCalculated: "true",
          createdDate: "2024-06-25T12:08:34.350+00:00",
          modifiedDate: "2024-06-26T12:08:34.350+00:00",
          createdBy: "FPS LOADER",
          portOfOrigin: "UN",
          portOfDestination: "UN",
          modifiedBy: "CO2 Calculation",
          tot: "13.22691191",
          ops: "11.27353442",
          ene: "1.9533775",
          totEI: "1123.45781215",
          tkm: "11.7733944",
          status: "SUCCESS",
        },
      ],
      message: "",
      nextPageAvailable: true,
      offset: 1000,
      responseCode: 0,
      status: "Success",
    };
    if (eventType == "infiniteScroll") {
      this.preventMultiScroll = true;
    }
    // this.appSerice
    // 	.getTableDataOnCriteria(this.myForm.value, this.offset)
    // 	.pipe(
    // 		finalize(() => {
    this.nextPageAvailable = newRes ? newRes.nextPageAvailable : false;
    this.offset = newRes ? newRes.offset : this.offset;
    if (eventType == "infiniteScroll") {
      // this.preventMultiScroll=true;
      this.data = { action: "append", payload: newRes.data };
    } else {
      this.preventMultiScroll = false;
      this.setRows(newRes);
    }
    // 	})
    // )
    // .subscribe((res: any) => {
    // 	this.preventMultiScroll = false;
    // 	newRes = res;
    // });
  }
  setRows(configs) {
    this.rows =
      configs && configs.data && configs.data && configs.data.length > 0
        ? configs.data
        : [];
  }
  selectedRows($event) {
    console.log($event);
  }
  selectionEvents($event) {
    console.log($event);
  }
  detailLovEvents(data) {
    console.log(data);
  }
  detailLovEvents1(data) {
    console.log(data);
  }
  co2scrollEvents(event) {
    // this.preventMultiScroll=false;
    if (event.type == "scrollEnd" && event.status) {
      if (this.nextPageAvailable && this.preventMultiScroll == false) {
        console.log(this.offset);
        //  this.preventMultiScroll=false;
        if (!this.preventFilterScroll) {
          this.getTableDataOnCriteria("infiniteScroll");
        }
      }
    }
  }
  serverEvents(event) {
    this.preventFilterScroll = false;
    event.payload.map((i) => {
      if (i.filter.applied && i.filter.condition != "clear") {
        this.preventFilterScroll = true;
      }
    });
  }
  ngOnDestroy() {
    if (this.searchParamsChangeSub$) this.searchParamsChangeSub$.unsubscribe();
  }
}
