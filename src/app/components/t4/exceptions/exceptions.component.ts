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
  carriers = [];
  transformedData: any;
  lanes = [];
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
  exceptionsModeData: any = [];
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
        if (
          Object.keys(this.searchParams).length &&
          this.searchParams.searchStandardFormGroup.monthYear &&
          currentUrl === pathToMatch
        ) {
          const obj = {
            standardFilters: this.searchParams.searchStandardFormGroup,
            customFilters: this.searchParams.searchCustomFormGroup1,
          };
          
          this.exceptionsTable();
          this.exceptionModeGraph(obj);
          this.exceptionCarrerGraph(obj);
          this.exceptionLaneGraph(obj);
          this.searchService.setTabData(false);
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
  hasData(): boolean {
    const keys = this.getKeys(this.transformedData);
    if (keys.length === 0) {
      return false;
    }

    return keys.some(
      (key) =>
        this.transformedData[key]["Grand Total"] ||
        this.getExceptionMonths().length > 0
    );
  }
  exceptionsTable() {
    const convertDateArray = this.convertToDateStrings(
      this.searchParams.searchStandardFormGroup.monthYear
    );
    const obj = {
      receivedDates: convertDateArray,
      clientCode:
        this.searchParams.searchStandardFormGroup.clientCode.toString(),
    };
    this.appService.exceptionsTableSummary(obj).subscribe((res: any) => {
      if (res) {
        this.exceptionsTableData = res.data;
        this.transformedData = this.transformData(this.exceptionsTableData);
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
    // Get list of months
    // const months = this.getMonths(startDate, endDate);
    const months = this.getFormattedDates(data);
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
  getFormattedDates(response: any[]): string[] {
    // Create a mapping of short month names to their numerical equivalents
    const monthMap = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    return response.map((item) => {
      const [monthShort, yearShort] = item.receivedDateShorten.split("-");

      // Convert the year to the full 4 digits
      const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;

      // Convert the month short name to its numerical value
      const month = monthMap[monthShort];

      // Return the formatted date in MM-YYYY format
      return `${month}-${year}`;
    });
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

  getKeys(obj) {
    if (!obj) {
      return [];
    }
    return Object.keys(obj);
  }

  getExceptionMonths(): string[] {
    const transformedData = this.transformedData || {};
    const firstKey = this.getKeys(transformedData)[0];

    if (!firstKey) {
      return []; // or handle the case where there are no keys
    }

    const exceptionData = transformedData[firstKey] || {};
    return this.getKeys(exceptionData)
      .filter((key) => key !== "Grand Total")
      .sort((a, b) => {
        const [monthA, yearA] = a.split("-");
        const [monthB, yearB] = b.split("-");

        const months = [
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
        ];

        const yearDiff = parseInt(yearA) - parseInt(yearB);
        if (yearDiff !== 0) {
          return yearDiff;
        }
        return months.indexOf(monthA) - months.indexOf(monthB);
      });
  }

  exceptionModeGraph(obj) {
    this.exceptionsModeData = [];
    this.appService.exceptionsModeGraph(obj).subscribe((res: any) => {
      if (res && res.length > 0) {
        this.exceptionsModeData = res;
        setTimeout(() => {
          this.generateModeChart(res);
        }, 0);
      }
    });
  }
  generateModeChart(data) {
    console.log("Generating chart...");
    c3.generate({
      bindto: "#chart",
      data: {
        columns: data,
        type: "pie", // Bubble might not be directly available; use scatter
      },
      pie: {
        label: {
          show: false, // Hide labels by default inside the pie segments
        },
      },
      tooltip: {
        format: {
          value: function (value, ratio, id) {
            // Show the actual value, without any percentage
            return value;
          },
        },
      },
      legend: {
        show: true,
        position: "bottom",
      },
    });
  }
  exceptionCarrerGraph(payLoad) {
    this.appService.exceptionsCarrerGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.carriers = res;
      }
    });
  }
  exceptionLaneGraph(payLoad) {
    this.appService.exceptionsLaneGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.lanes = res;
      }
    });
  }
}
