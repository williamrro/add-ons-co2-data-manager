import { Component, OnInit } from "@angular/core";
import { ISubscription } from "rxjs/Subscription";
import { SearchService } from "../../../services/search.service";
import { AppService } from "../../../app.service";
import { Router } from "@angular/router";
declare var c3: any;
@Component({
  selector: "app-exceptions",
  templateUrl: "./exceptions.component.html",
  styleUrls: ["./exceptions.component.scss"],
})
export class ExceptionsComponent implements OnInit {
  searchParamsChangeSub$: ISubscription;
  searchParams: any = {};
  exceptionsTableData: any = [];
  transformedData: any;
  carriers = [
    {
      id: "1",
      value: "116.61",
      param1: "UPSA",
      param2: "UPS AIR FREIGHT SERVICES INC",
    },
    {
      id: "2",
      value: "27.1",
      param1: "ODFL",
      param2: "OLD DOMINION FREIGHT LINE",
    },
    {
      id: "3",
      value: "151.98",
      param1: "UPSN",
      param2: "UNITED PARCEL SERVICE",
    },
    {
      id: "4",
      value: "13419.2",
      param1: "EXDO",
      param2: "EXPEDITORS INTL",
    },
    {
      id: "5",
      value: "322.78",
      param1: "ABLN",
      param2: "ASCENT LOGISTICS (ABLN)",
    },
  ];
  monthNames = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };
  constructor(
    private searchService: SearchService,
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    // Define the path to match
    const pathToMatch = "/t4/exceptions";
    this.searchParamsChangeSub$ = this.searchService.getSearchParams$.subscribe(
      (params: any) => {
        this.searchParams = params || {};
        console.log(this.searchParams);

        if (
          Object.keys(this.searchParams).length &&
          this.searchParams.searchStandardFormGroup.monthYear &&
          currentUrl === pathToMatch
        ) {
          console.log(this.searchParams.searchStandardFormGroup.monthYear);
          this.exceptionsTable();
        }
      }
    );
  }
  getBarWidth(data, value: number): string {
    const maxValue = Math.max(...data.map((lane) => Number(lane.value)));
    const factor = 100 / maxValue;
    return value * factor + "%";
  }
  // Method to convert the original array to the desired format
  convertToDateStrings(inputArray: string[]): string[] {
    return inputArray.map((dateString) => {
      const [monthName, year] = dateString.split(" ");
      const month = new Date(Date.parse(monthName + " 1, 2021")).getMonth() + 1; // Get month number (1-based index)
      const formattedMonth = month < 10 ? `0${month}` : month; // Add leading zero if needed
      return `${year}-${formattedMonth}-01`; // Format as YYYY-MM-DD
    });
  }
  exceptionsTable() {
    const convertDateArray = this.convertToDateStrings(
      this.searchParams.searchStandardFormGroup.monthYear
    );
    console.log(convertDateArray);
    const obj = {
      receivedDates: convertDateArray,
    };
    this.appService.exceptionsTableSummary(obj).subscribe((res: any) => {
      if (res) {
        console.log(res);
        this.exceptionsTableData = res.data;
        this.transformedData = this.transformData(this.exceptionsTableData);
        console.log(this.transformedData);
      }
    });
  }
  ngOnDestroy() {
    if (this.searchParamsChangeSub$) this.searchParamsChangeSub$.unsubscribe();
  }
  private getMonths(startDate: Date, endDate: Date): string[] {
    const months = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthYear = `${this.pad(
        currentDate.getMonth() + 1
      )}-${currentDate.getFullYear()}`;
      months.push(monthYear);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  private pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  transformData(data: any[]): any {
    const result = {};

    // Define start and end date for the last 3 years up to current month
    const endDate = new Date();
    const startDate = new Date(2020, 0, 20);

    // Get list of months
    const months = this.getMonths(startDate, endDate);

    // Process the data
    data.forEach((item) => {
      if (item.exceptionReason) {
        if (!result[item.exceptionReason]) {
          result[item.exceptionReason] = {};
        }
        result[item.exceptionReason][item.receivedDateShorten] = item.count;
        result[item.exceptionReason]["Grand Total"] = item.grandTotal;
      }
    });

    // Add missing months for each exceptionReason
    Object.keys(result).forEach((key) => {
      months.forEach((month) => {
        if (!result[key][month]) {
          result[key][month] = "";
        }
      });
    });
    const formattedData = Object.keys(result).reduce((acc, key) => {
      acc[key] = this.reformatKeys(result[key]);
      return acc;
    }, {});
    return formattedData;
  }
  reformatKeys(obj) {
    const reformatted = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Check if key matches the date format 'MM-YYYY'
        const match = key.match(/^(\d{2})-(\d{4})$/);
        if (match) {
          const month = match[1];
          const year = match[2].slice(-2);
          // Replace key with formatted month and year
          const newKey = `${this.monthNames[month]}-${year}`;
          if (!reformatted.hasOwnProperty(newKey)) {
            reformatted[newKey] = obj[key];
          }
        } else {
          // Keep non-date keys as is
          reformatted[key] = obj[key];
        }
      }
    }

    return reformatted;
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getMonths1(): string[] {
    const firstKey = this.getKeys(this.transformedData)[0];
    return this.getKeys(this.transformedData[firstKey]).filter(
      (key) => key !== "Grand Total"
    );
  }
  ngAfterViewInit() {
    this.generateChart();
  }

  generateChart() {
    console.log("Generating chart...");
    c3.generate({
      bindto: "#chart",
      data: {
        columns: [
          ["AIR", 20],
          ["SURFACE", 30],
        ],
        type: "scatter", // Bubble might not be directly available; use scatter
        labels: true,
      },
      point: {
        r: (d) => {
          console.log("Data point:", d); // Check if points are correctly calculated
          return d.value * 2; // Adjust as necessary
        },
      },
      axis: {
        x: {
          tick: {
            format: () => "", // Keep X-axis clean
          },
        },
        y: {
          show: false, // Hide Y-axis
        },
      },
      legend: {
        show: true,
        position: "bottom",
      },
    });
  }
}
