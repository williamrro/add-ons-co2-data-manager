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
  chart: any;
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
    // Function to filter the data
    const groupValues = data.map(item => item[0]);
    this.chart = c3.generate({
      bindto: "#mode-chart",
      data: {
        columns: data,
        type: "bar",
        groups: [ groupValues ],
        order: null,
        onmouseover: (d) => {
          this.chart.focus(d.id); // Highlight the hovered bar
        },
        onmouseout: () => {
          this.chart.revert(); // Revert back to original state
        },
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
        width: {
          ratio: 1, // Full-width bars
        },
      },
      size: {
        height: 70,
        width: 1200,
        // width: 700  // Adjust width to fit container
      },
      color: {
        pattern: [
          "#d4af37",
          "#f39c12",
          "#d35400",
          "#16a085",
          "#2980b9",
          "#8e44ad",
        ],
      },
      legend: {
        position: "bottom",
      },
      tooltip: {
        grouped: false, // Disable grouped tooltips
        contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
          // Safely access chart data values
          const valuesArray = this.chart.data.values() || []; // Ensure it's an array
          const total =
            valuesArray.length > 0
              ? valuesArray.reduce((sum, val) => sum + val, 0)
              : 0;

          const value = d[0].value;
          const percentage =
            total > 0 ? ((value / total) * 100).toFixed(0) + "%" : "N/A";

          // Customize the tooltip HTML
          return `<div style="background-color: #333; color: #fff; padding: 8px 12px; border-radius: 5px; text-align: center;">
                    <strong>${d[0].id}</strong><br/>
                    ${value} (${percentage})
                  </div>`;
        },
        position: function (data, width, height, element) {
          const mouseEvent = window.event as MouseEvent;
          const chartOffsetY = document
              .querySelector("#mode-chart")
              .getBoundingClientRect().top,
            tooltipOffsetY = height,
            mouseY = mouseEvent.pageY,
            mouseX = mouseEvent.pageX;
          return {
            top: mouseY - chartOffsetY - tooltipOffsetY - 10,
            left: mouseX - width / 2,
          };
        },
      },
      grid: {
        focus: {
          show: false, // Hide hover line
        },
      },
      interaction: {
        enabled: true,
      },
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
