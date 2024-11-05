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
  lanes: any[] = [];
  carriers = [];
  tableConfig = {
    "By Carrier": {
      headers: ["Carrier Code", "Carrier Name", "Value"],
      dataKey: "carriers",
    },
    "By Lane": {
      headers: ["Lane by Country", "Lane by City", "Value"],
      dataKey: "lanes",
    },
  };
  summaryModeData: any = [];
  chart: any;
  showPopup: boolean;
  pageNumber: number = 1;
  pageSize: number = 20;
  totalCount: any;
  totalPages: any;
  popupData: any[];
  popupTitle: string;
  carrierTotalPages: any;
  laneTotalPages: any;
  carrierTotalCount: any;
  laneTotalCount: any;
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
    this.searchService.setTabData(true);
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
    this.appService
      .detailCarrerGraph(payLoad, this.pageNumber, this.pageSize)
      .subscribe((res: any) => {
        if (res) {
          this.carriers = [];
          setTimeout(() => {
            this.carriers = res.data;
            this.carrierTotalPages = res.totalPages;
            this.carrierTotalCount = res.count;
          }, 0); // Short delay to trigger change detection
        }
      });
  }
  detailLaneGraph(payLoad) {
    this.appService
      .detailLaneGraph(payLoad, this.pageNumber, this.pageSize)
      .subscribe((res: any) => {
        if (res) {
          this.lanes = [];
          setTimeout(() => {
            this.lanes = [...res.data];
            this.laneTotalPages = res.totalPages;
            this.laneTotalCount = res.count;
          }, 0); // Short delay to trigger change detection
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
    const groupValues = data.map((item) => item[0]);
    this.chart = c3.generate({
      bindto: "#mode-chart",
      data: {
        columns: data,
        type: "bar",
        groups: [groupValues],
        order: null,
        onmouseover: (d) => {
          this.chart.focus(d.id); // Highlight the hovered bar
          this.greyOutOthers(d.id); // Grey out non-hovered bars
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
          padding: {
            top: 50, // Add space above bars
          },
        },
      },
      // axis: {
      //   rotated: true,
      //   x: {
      //     show: false,
      //   },
      //   y: {
      //     show: false,
      //     min: 0, // Ensures the y-axis starts at 0
      //     padding: {
      //       top: 100, // Add some padding at the top for better visibility
      //     },
      //   },
      // },

      bar: {
        width: {
          ratio: 0.9, // Full-width bars
          max: 50,
        },
      },
      size: {
        height: 70, // Keep the height as it is
        width: 1000,
        // width: (document.querySelector("#mode-chart") as HTMLElement).offsetWidth // Cast to HTMLElement to access offsetWidth
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
        // This ensures legend hover behaves normally (if needed)
        item: {
          shape: {
            type: "circle",
          },
          onmouseover: (id) => {
            this.chart.focus(id); // Highlight legend's bar
            this.greyOutOthers(id); // Grey out other bars
          },
          onmouseout: () => {
            this.chart.revert(); // Revert when leaving the legend hover
          },
        },
        show: false,
      },
      tooltip: {
        grouped: false,
        contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
          const value = d[0].value;
          this.chart.focus(d[0].id); // Highlight the hovered bar
          this.greyOutOthers(d[0].id); // Grey out other bars

          // Customize the tooltip HTML
          return `
                <div class="tooltip" style="background-color: #323232; color: #fff; padding: 5px 10px; border-radius: 5px; position: relative; z-index: 1000;">
                    <span style="color: #989898; font-family: 'Open Sans'; font-size: 12px; font-weight: 600;">${d[0].id}</span><br/>
                    <span style="color: #FFF; font-family: 'Open Sans'; font-size: 12px; font-weight: 600;">${value}</span>
                    <div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 11px solid #333; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);"></div>
                </div>`;
        },
        position: function (data, width, height, element) {
          const targetBar = element.getBoundingClientRect();
          const chartOffset = document
            .querySelector("#mode-chart")
            .getBoundingClientRect();

          const top = targetBar.top - chartOffset.top - height - 10; // Adjusting for height
          const left =
            targetBar.left + targetBar.width / 2 - width / 2 - chartOffset.left;

          console.log("Tooltip Position - Top:", top, "Left:", left); // Debugging output

          return {
            top: top,
            left: left,
          };
        },
        onmouseout: () => {
          this.chart.revert(); // Revert to the original state
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
    this.insertCustomLegend();
  }
  insertCustomLegend() {
    const legendContainer = document.querySelector("#mode-chart-legend");

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
  greyOutOthers(hoveredId) {
    const ids = this.chart.data().map((d) => d.id);
    ids.forEach((id) => {
      if (id !== hoveredId) {
        this.chart.defocus(id); // Grey out non-hovered bars
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
  openPopup(headerValue: string) {
    // Reset popup display
    this.showPopup = false;
    // Set popup data and title based on headerValue
    const isCarrier = headerValue === "carrier";
    this.popupData = isCarrier ? this.carriers : this.lanes;
    this.popupTitle = isCarrier ? "By Carrier" : "By Lane";
    this.totalPages = isCarrier ? this.carrierTotalPages : this.laneTotalPages;
    this.totalCount = isCarrier ? this.carrierTotalCount : this.laneTotalCount;

    // Show popup only if there's data
    this.showPopup = this.popupData.length > 0;
  }
  closePopupClicked(data) {
    console.log(data);
    this.showPopup = false;
  }
  closePopup() {
    this.showPopup = false;
  }
  // Listen to page change from the child component
  onPageChange(event: { page: number; itemsPerPage: number }, title?: string) {
    console.log(event, event.page, event.itemsPerPage, title);
    this.pageNumber = event.page;
    this.pageSize = event.itemsPerPage;
    // console.log(page);
    const obj = {
      standardFilters: this.searchParams.searchStandardFormGroup,
      customFilters: this.searchParams.searchCustomFormGroup1,
    };
    // this.detailCarrerGraph(obj);
    if (title === "By Carrier") {
      this.detailCarrerGraph(obj);
    } else {
      this.detailLaneGraph(obj);
    }
  }
}
