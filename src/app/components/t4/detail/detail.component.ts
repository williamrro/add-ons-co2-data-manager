import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ISubscription } from "rxjs/Subscription";
import { SearchService } from "../../../services/search.service";
import { AppService } from "../../../app.service";
// import * as c3 from 'c3';
declare var c3: any;
interface Carrier {
  code: string;
  names: string[];
  value: number[]; // or number if not an array
}
@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit, AfterViewInit {
  searchParamsChangeSub$: ISubscription;
  searchParams: any = {};
  carriers: Carrier[] = [
    {
      code: "DSVEU",
      names: ["DSV", "DSV AIR & SEA NEDERLAND BV"],
      value: [539, 16789],
    },
    { code: "FDE", names: ["FEDEX EXPRESS"], value: [3539] },
    {
      code: "KHNN",
      names: ["KUEHNE & NAGEL (KHNN)", "KUEHNE+NAGEL IE"],
      value: [2539, 0],
    },
    { code: "UPSSCS", names: ["UPS Supply Chain Solutions"], value: [1539] },
    { code: "DGFLNL", names: ["DHL GLOBAL FORWARDING"], value: [6539] },
    { code: "DSV", names: ["DSV"], value: [5539] },
    { code: "UPSS", names: ["UPS SUPPLY CHAIN SOLUTIONS"], value: [3539] },
    {
      code: "UPS",
      names: ["United Parcel Service", "UPS SMALL PARCELS"],
      value: [13339, 0],
    },
    // Additional carriers...
  ];
  maxValue: number;
  summaryYearData: any[];
  summaryTableData: any = [];
  // sortTable(column: string) {
  //   this.carriers.sort((a, b) => a[column].localeCompare(b[column]));
  // }
  tabs = ["By Mode", "By Carrier", "By Lane"];
  currentTab = "By Mode";
  currentYear: number = new Date().getFullYear();
  selectedYear: { [key: number]: number } = {};
  chart1: any;
  constructor(
    private searchService: SearchService,
    private appService: AppService
  ) {}

  ngOnInit() {
    this.selectedYear[this.currentYear] = this.currentYear;
    this.selectedYear[this.currentYear - 1] = this.currentYear - 1;
    this.searchParamsChangeSub$ = this.searchService.getSearchParams$.subscribe(
      (params: any) => {
        this.searchParams = params || {};
        if (Object.keys(this.searchParams).length) {
          this.appService.getAllSummaryYears().subscribe((res: any) => {
            console.log(res);
            this.summaryYearData = res;
          });
          this.summaryApiData();
          this.generateModeChart();
        }
      }
    );
    // const flattenedValues = this.carriers
    //   .map((carrier) => carrier.value) // Create an array of value arrays
    //   .reduce((acc, curr) => acc.concat(curr), []); // Flatten the array

    // // Find the maximum value
    // this.maxValue = Math.max(...flattenedValues);
    // console.log(this.maxValue);
    // // Sort the carriers array by the maximum value in each carrier's values array (descending order)
    // this.carriers.sort((a, b) => {
    //   return Math.max(...b.value) - Math.max(...a.value);
    // });
    const flattenedValues = this.carriers
      .map((carrier) => carrier.value) // Create an array of value arrays
      .reduce((acc, curr) => acc.concat(curr), []); // Flatten the array

    // Find the maximum value
    this.maxValue = Math.max(...flattenedValues);
    // Sort the carriers array by the maximum value in each carrier's values array (descending order)
    this.carriers.sort((a, b) => {
      return Math.max(...b.value) - Math.max(...a.value);
    });
  }
  generateBarChart(bindToId: string, value: number) {
    c3.generate({
      bindto: `#${bindToId}`,
      data: {
        columns: [["Value", value]],
        type: "bar",
      },
      bar: {
        width: {
          ratio: 0.7, // Adjust bar width here
        },
      },
      axis: {
        x: {
          show: false,
        },
        y: {
          show: false,
          min: 0,
          max: 20000, // Adjust based on the maximum value
        },
      },
      size: {
        height: 40, // Adjust height to make all charts consistent
      },
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      tooltip: {
        show: false,
      },
      legend: {
        show: false,
      },
    });
  }
  // ngAfterViewInit1() {
  //   // this.carriers.forEach((carrier, index) => {
  //   //   carrier.value.forEach((val, i) => {
  //   //     console.log('Value:', val); // Debugging: Check each value
  //   //     this.generateChart1(`chart${index}-${i}`, val, this.maxValue);
  //   //   });
  //   // });
  //   this.generateCharts();
  //   // this.carriers.forEach(carrier => {
  //   //   carrier.value.forEach((val, index) => {
  //   //     this.generateBarChart(`chart${carrier.code}${index}`, val);
  //   //   });
  //   // });
  //   // this.generateModeChart();
  // }
  ngAfterViewInit() {
    this.carriers.forEach((carrier, index) => {
      carrier.value.forEach((val, i) => {
        this.generateChart11(`chart${index}-${i}`, val, this.maxValue);
      });
    });
    // this.generateCharts();
  }

  generateChart11(elementId: string, value: number, maxValue: number) {
    const widthPercentage = (value / maxValue) * 100;
    const chartElement = document.getElementById(elementId);
    if (chartElement) {
      // Directly set the width of the chart container based on the value
      chartElement.style.width = `${widthPercentage}%`;
      chartElement.style.height = "20px";
      chartElement.style.backgroundColor = "#1f77b4";
      chartElement.style.margin = "0 0 5px 0";
    }
  }
  generateModeChart() {
    c3.generate({
      bindto: "#mode-chart",
      data: {
        columns: [
          ["AIR", 237929],
          ["SURFACE", 13138],
          ["OCEAN", 70000], // Add other categories as needed
          ["RAIL", 15000],
        ],
        type: "pie",
      },
      pie: {
        label: {
          format: (value, ratio, id) => {
            return `${id} \n${value.toLocaleString()}`;
          },
        },
      },
      color: {
        pattern: ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728"], // Colors for AIR, SURFACE, OCEAN, RAIL
      },
      legend: {
        position: "right",
      },
    });
  }
  toggleTab(tab: string) {
    this.currentTab = tab;
    // this.chartGenerated = false;
    // this.tableDataLoaded = false;
    if (this.chart1) {
      this.chart1.flush();
    }
  }
  summaryApiData() {
    const obj = {
      basePeriod: 2023,
      currentPeriod: 2024,
      standardFilters: this.searchParams.searchStandardFormGroup,
      customFilters: this.searchParams.searchCustomFormGroup1,
    };
    console.log(this.searchParams);

    this.appService.summaryTableInfo(obj).subscribe((res: any) => {
      console.log(res);
      if (res) {
        this.summaryTableData = res.table_data;
        // this.summaryTableData[2]["UOM"] = "KG";
        console.log(this.summaryTableData);
      }
    });
  }

  generateCharts() {
    this.carriers.forEach((carrier, index) => {
      carrier.value.forEach((val, i) => {
        c3.generate({
          bindto: `#chart-${index}-${i}`,
          size: {
            height: 20,
            width: 200 * (val / 13359), // Adjust width based on value
          },
          data: {
            columns: [["data", val]],
            type: "bar",
            labels: true,
          },
          axis: {
            x: { show: false },
            y: { show: false },
          },
          bar: {
            width: {
              ratio: 0.8, // This makes the bar width 80% of the chart width
            },
          },
          legend: {
            show: false,
          },
          tooltip: {
            show: false,
          },
        });
      });
    });
  }
  generateChart1(elementId: string, value: number, maxValue: number) {
    const widthPercentage = (value / maxValue) * 100;
   this.chart1= c3.generate({
      bindto: `#${elementId}`,
      data: {
        columns: [["data", value]],
        type: "bar",
        colors: {
          data: "#1f77b4",
        },
        labels: true,
      },
      axis: {
        rotated: true,
        x: {
          show: false,
        },
        y: {
          show: false,
        },
      },
      bar: {
        // width: {
        //   ratio: 1  // Full height
        // }
      },
      size: {
        height: 40, // Adjust the height for each bar
      },
      padding: {
        left: 0,
        right: 0,
      },
      legend: {
        show: false,
      },
      tooltip: {
        show: false,
      },
    });

    // // Set the width of the chart dynamically based on the value
    // // const chartElement = document.getElementById(elementId);
    // // if (chartElement) {
    // //   chartElement.style.width = `${widthPercentage}%`;
    // //   chartElement.style.height = '40px';
    // // }
    // const chartElement = document.getElementById(elementId);
    // if (chartElement) {
    //   // Directly set the width of the chart container based on the value
    //   chartElement.style.width = `${widthPercentage}%`;
    //   chartElement.style.height = "40px";
    //   chartElement.style.backgroundColor = "#1f77b4";
    //   chartElement.style.margin = "0 0 5px 0";
    // }
    // const widthPercentage = (value / maxValue) * 100;

    console.log("Width Percentage:", widthPercentage); // Debugging: Check the calculated width percentage

    const chartElement = document.getElementById(elementId);
    if (chartElement) {
      // Directly set the width of the chart container based on the value
      chartElement.style.width = `${widthPercentage}%`;
      chartElement.style.height = "40px";
      chartElement.style.backgroundColor = "#1f77b4";
      chartElement.style.margin = "0 0 5px 0";
    }

    // return chart;
  }
  ngOnDestroy() {
    if (this.searchParamsChangeSub$) this.searchParamsChangeSub$.unsubscribe();
    if (this.chart1) {
      this.chart1.destroy();
    }
  }

}
