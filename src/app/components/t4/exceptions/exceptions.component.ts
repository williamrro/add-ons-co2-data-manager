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
  lanes = [
    {
      id: "28",
      value: "2966.82",
      param1: "IND To NLD",
      param2: "SALCETTE,IND To VEENENDAAL,NLD",
    },
    {
      id: "109",
      value: "1944.15",
      param1: "MEX To NLD",
      param2: "ZAPOPAN,MEX To VEENENDAAL,NLD",
    },
    {
      id: "53",
      value: "1834.84",
      param1: "USA To NLD",
      param2: "MISSION,USA To VEENENDAAL,NLD",
    },
    {
      id: "24",
      value: "881.81",
      param1: "CHN To ITA",
      param2: "SUZHOU,CHN To FAENZA,ITA",
    },
    {
      id: "27",
      value: "790.16",
      param1: "CHN To GBR",
      param2: "CIXI CITY,CHN To TAMWORTH,GBR",
    },
    {
      id: "68",
      value: "631.42",
      param1: "CZE To ZAF",
      param2: "BRNO,CZE To MIDRAND,ZAF",
    },
    {
      id: "87",
      value: "484.34",
      param1: "IND To TUR",
      param2: "SALCETTE,IND To ISTANBUL,TUR",
    },
    {
      id: "70",
      value: "360.61",
      param1: "USA To CZE",
      param2: "HIGH POINT,USA To BRNO,CZE",
    },
    {
      id: "84",
      value: "338.14",
      param1: "USA To CZE",
      param2: "RICHMOND,USA To BRNO,CZE",
    },
    {
      id: "90",
      value: "286.91",
      param1: "USA To NLD",
      param2: "HICKORY,USA To VEENENDAAL,NLD",
    },
    {
      id: "31",
      value: "275.48",
      param1: "USA To USA",
      param2: "WEST NYACK,USA To LEWISVILLE,USA",
    },
    {
      id: "23",
      value: "270.83",
      param1: "CHN To DEU",
      param2: "SUZHOU,CHN To BUCHDORF,DEU",
    },
    {
      id: "34",
      value: "234.72",
      param1: "USA To CZE",
      param2: "MISSION,USA To BRNO,CZE",
    },
    {
      id: "30",
      value: "211.3",
      param1: "CHN To ITA",
      param2: "SUZHOU,CHN To AGRATE BRIANZA,ITA",
    },
    {
      id: "94",
      value: "175.58",
      param1: "USA To GBR",
      param2: "HICKORY,USA To RHYL,GBR",
    },
    {
      id: "75",
      value: "144.16",
      param1: "IND To IND",
      param2: "HYDERABAD,IND To LOS ANGELES,IND",
    },
    {
      id: "21",
      value: "113.57",
      param1: "USA To CZE",
      param2: "HICKORY,USA To BRNO,CZE",
    },
    {
      id: "33",
      value: "96.29",
      param1: "IRL To USA",
      param2: "DUBLIN,IRL To CLAREMONT,USA",
    },
    {
      id: "100",
      value: "85.98",
      param1: "USA To USA",
      param2: "SEVEN VALLEYS,USA To SAN ANTONIO,USA",
    },
    {
      id: "1",
      value: "74.65",
      param1: "USA To NLD",
      param2: "CARY,USA To VEENENDAAL,NLD",
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
