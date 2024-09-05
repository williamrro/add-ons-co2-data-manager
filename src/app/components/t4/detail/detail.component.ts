import { ChangeDetectorRef, Component, OnInit, OnDestroy } from "@angular/core";
import { ISubscription } from "rxjs/Subscription";
import { SearchService } from "../../../services/search.service";
import { AppService } from "../../../app.service";
import { Router } from "@angular/router";
declare var c3: any;

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit, OnDestroy {
  searchParamsChangeSub$: ISubscription;
  searchParams: any = {};
  maxValue: number;
  summaryYearData: any[];
  summaryTableData: any = [];
  tabs = ["By Mode", "By Carrier", "By Lane"];
  currentTab = "By Mode";
  currentYear: number = new Date().getFullYear();
  selectedYear: { [key: number]: number } = {};
  modeChart: any;
  lanes = [];
  carriers = [];
  tableConfig = {
    "By Carrier": {
      headers: ["CARRIER", "CARRIER_NAME", "VALUE"],
      dataKey: "carriers",
    },
    "By Lane": {
      headers: ["Lane by Country", "Lane by City", "VALUE"],
      dataKey: "lanes",
    },
  };
  summaryModeData: any = [];

  constructor(
    private searchService: SearchService,
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedYear[this.currentYear] = this.currentYear;
    this.selectedYear[this.currentYear - 1] = this.currentYear - 1;
    const currentUrl = this.router.url;
    // Define the path to match
    const pathToMatch = "/t4/detail";
    this.searchParamsChangeSub$ = this.searchService.getSearchParams$.subscribe(
      (params: any) => {
        this.searchParams = params || {};
        if (
          Object.keys(this.searchParams).length &&
          currentUrl === pathToMatch
        ) {
          this.appService.getAllSummaryYears().subscribe((res: any) => {
            this.summaryYearData = res;
          });
          this.summaryApiData();
          const obj = {
            standardFilters: this.searchParams.searchStandardFormGroup,
            customFilters: this.searchParams.searchCustomFormGroup1,
          };
          this.detailModeGraph(obj);
          this.detailCarrerGraph(obj);
          this.detailLaneGraph(obj);
        }
      }
    );
  }
  detailModeGraph(payLoad) {
    this.appService.detailModeGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.summaryModeData = res;
        setTimeout(() => {
          this.generateModeChart(res);
        }, 0);
      }
    });
  }
  detailCarrerGraph(payLoad) {
    this.appService.detailCarrerGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.carriers = res;
      }
    });
  }
  detailLaneGraph(payLoad) {
    this.appService.detailLaneGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.lanes = res;
      }
    });
  }
  // To calculate width of the bar graph in table row
  getBarWidth(data, value: number): string {
    const maxValue = Math.max(...data.map((lane) => Number(lane.value)));
    const factor = 100 / maxValue;
    return value * factor + "%";
  }

  getTableHeaders(): string[] {
    return this.tableConfig[this.currentTab].headers;
  }

  getTableData(): any[] {
    return this[this.tableConfig[this.currentTab].dataKey];
  }

  generateModeChart(data) {
    this.modeChart = c3.generate({
      bindto: "#mode-chart",
      data: {
        columns: data,
        type: "pie",
      },
      pie: {
        label: {
          show: false, // Hide labels by default
          format: (value, ratio, id) => `${id} \n${(ratio * 100).toFixed(1)}%`, // Format for hover
        },
        onmouseover: (id, index, element) => {
          const data = this.modeChart.data();
          const label = data[0].values[index].value;
          const percentage =
            (data[0].values[index].ratio * 100).toFixed(1) + "%";
          element.querySelector("text").textContent = `${id} \n${percentage}`;
        },
        onmouseout: (id, index, element) => {
          element.querySelector("text").textContent = ""; // Clear the label when not hovering
        },
      },
      color: {
        pattern: ["#1f77b4", "#2ca02c", "#ff7f0e", "#d62728"], // Colors for AIR, SURFACE, OCEAN, RAIL
      },
      legend: {
        position: "right",
      },
      size: {
        width: 400,  // Adjust the width to your needs
        height: 400, // Adjust the height to your needs
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      margin:{
        top:0
      }
    });
  }

  toggleTab(tab: string) {
    this.currentTab = tab;
  }

  summaryApiData() {
    const obj = {
      basePeriod: 2023,
      currentPeriod: 2024,
      standardFilters: this.searchParams.searchStandardFormGroup,
      customFilters: this.searchParams.searchCustomFormGroup1,
    };

    this.appService.summaryTableInfo(obj).subscribe((res: any) => {
      if (res) {
        this.summaryTableData = res.table_data;
      }
    });
  }

  ngOnDestroy() {
    if (this.searchParamsChangeSub$) this.searchParamsChangeSub$.unsubscribe();
    if (this.modeChart) {
      this.modeChart.destroy();
    }
  }
}
