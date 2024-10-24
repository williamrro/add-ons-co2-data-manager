import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { AppService } from "../../../app.service";
import { SearchService } from "../../../services/search.service";
import { ISubscription } from "rxjs/Subscription";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-t4",
  templateUrl: "./t4.component.html",
  styleUrls: ["./t4.component.scss"],
})
export class T4Component implements OnInit, AfterViewInit {
  @HostBinding("class") class = "autoFlexColumn";
  @ViewChild("tooltipContainer") tooltipContainer: ElementRef;
  years = [2024, 2023, 2022];
  headers = [
    { label: "UOM", tooltip: "Unit Of Measure" },
    { label: "ENE", tooltip: "Energy consumption" },
    {
      label: "OPS",
      tooltip: "Operational emissions, comparable to tank-to-wheel (TTW)",
    },
    { label: "TOT", tooltip: "Total Emissions" },
    { label: "TOT_EI", tooltip: "TOT_EI" },
    { label: "Compensation USD", tooltip: "Compensation USD" },
  ];
  summaryYearData: any[];
  summaryTableData: any = [];
  summaryGraphData: any = [];
  selectedYear: { [key: number]: number } = {};
  currentYear: number = new Date().getFullYear();
  baselineYear: number;
  searchParams: any = {};
  searchParamsChangeSub$: ISubscription;
  basePeriodTableHide: boolean = true;
  showBaselineComparison: boolean = true;
  constructor(
    private appService: AppService,
    private searchService: SearchService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.appService.getT4Auth().subscribe((resp: any) => {
      const { userId = "", assignedClients = [] } = resp || {};
      const sortedClientsList = assignedClients.sort();

      this.searchService.setUserData(userId, sortedClientsList);
    });
    this.selectedYear[this.currentYear] = this.currentYear;
    this.selectedYear[this.currentYear - 1] = this.currentYear - 1;
    this.searchParamsChangeSub$ = this.searchService.getSearchParams$.subscribe(
      (params: any) => {
        this.searchParams = params || {};
        if (Object.keys(this.searchParams).length) {
          this.appService.getAllSummaryYears().subscribe((res: any) => {
            this.summaryYearData = res;
            this.summaryApiData();
          });
        }
      }
    );
    this.searchService.getTabData$.subscribe((res) => {
      // Defer the change to the next JavaScript execution cycle
      setTimeout(() => {
        this.showBaselineComparison = res;
      }, 0);
    });
    this.cdr.detectChanges();
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
        if (this.summaryTableData && this.summaryTableData.length > 1) {
          this.baselineYear = this.summaryTableData[0].const_year;
          this.currentYear = this.summaryTableData[1].const_year;
        } else {
          // Optionally set default values for baselineYear and currentYear
          this.baselineYear = null; // or a default value
          this.currentYear = null; // or a default value
        }
      }
    });
  }
  ngAfterViewInit(): void {
    // After the view is initialized, you can add logic for positioning
  }

  adjustTooltipPosition(event: MouseEvent, tooltip: HTMLElement) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    // Reset any existing adjustments
    this.renderer.setStyle(tooltip, "left", "unset");
    this.renderer.setStyle(tooltip, "right", "unset");

    // Check if tooltip is overflowing beyond the window's right edge
    if (tooltipRect.right > windowWidth) {
      // If overflowing, adjust its position to the left
      this.renderer.setStyle(tooltip, "right", "0px");
    } else {
      // Otherwise, position it normally
      this.renderer.setStyle(tooltip, "left", "0px");
    }
  }
}
