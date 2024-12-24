import {
  Component,
  OnInit,
  Renderer2,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { ISubscription } from "rxjs/Subscription";
import { SearchService } from "../../../services/search.service";
import { AppService } from "../../../app.service";
import { Router } from "@angular/router";
declare var c3: any;
declare var d3: any;
@Component({
  selector: "app-exceptions",
  templateUrl: "./exceptions.component.html",
  styleUrls: ["./exceptions.component.scss"],
})
export class ExceptionsComponent implements OnInit, AfterViewInit, OnDestroy {
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
  exceptionChart: any;
  chart: any;
  showByValue: any;
  private resizeTimeout: any;
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
          this.showByValue = (this.searchParams.searchStandardFormGroup
            .showBy || [])[0];

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
        // this.transformedData = this.transformData(this.exceptionsTableData);
        setTimeout(() => {
          this.renderCharts();
        }, 0);
      }
    });
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
    const groupValues = data.map((item) => item[0]);
    this.exceptionChart = c3.generate({
      bindto: "#exception-chart",
      data: {
        columns: data,
        type: "bar",
        groups: [groupValues],
        order: null,
        onmouseover: (d) => {
          this.exceptionChart.focus(d.id); // Highlight the hovered bar
          this.greyOutOthers(d.id); // Grey out non-hovered bars
        },
        onmouseout: () => {
          this.exceptionChart.revert(); // Revert back to original state
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
            // top: 50, // Add space above bars
          },
        },
      },
      bar: {
        width: {
          ratio: 0.9, // Full-width bars
          max: 50,
        },
      },
      size: {
        height: 70, // Keep the height as it is
        // width: 1000,
        // width: (document.querySelector("#exception-chart") as HTMLElement).offsetWidth,
        // width: document.querySelector("#exception-chart").clientWidth,
        // width: (document.querySelector("#mode-chart") as HTMLElement).offsetWidth // Cast to HTMLElement to access offsetWidth
      },
      color: {
        pattern: [
          "#5C98F3",
          "#3949AB",
          "#F48E16",
          "#AFF7D0",
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
            this.exceptionChart.focus(id); // Highlight legend's bar
            this.greyOutOthers(id); // Grey out other bars
          },
          onmouseout: () => {
            this.exceptionChart.revert(); // Revert when leaving the legend hover
          },
        },
        show: false,
      },
      tooltip: {
        grouped: false,
        contents: (d, defaultTitleFormat, defaultValueFormat, color) => {
          const value = d[0].value;
          this.exceptionChart.focus(d[0].id); // Highlight the hovered bar
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
            .querySelector("#exception-chart")
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
          this.exceptionChart.revert(); // Revert to the original state
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
  greyOutOthers(hoveredId) {
    const ids = this.exceptionChart.data().map((d) => d.id);
    ids.forEach((id) => {
      if (id !== hoveredId) {
        this.exceptionChart.defocus(id); // Grey out non-hovered bars
      }
    });
  }
  insertCustomLegend() {
    const legendContainer = document.querySelector("#exception-chart-legend");

    // Clear previous legends if any
    legendContainer.innerHTML = "";

    // Create custom legend manually
    const legendData = this.exceptionChart
      .data()
      .map((d) => {
        return `<span class="legend-item">
                <span style="background-color:${this.exceptionChart.color(
                  d.id
                )};" class="legend-color"></span>
                ${d.id}
              </span>`;
      })
      .join(" ");

    // Append the generated legend HTML to the container
    legendContainer.innerHTML = legendData;
  }
  exceptionCarrerGraph(payLoad) {
    this.appService.exceptionsCarrerGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.carriers = res;
      }
    });
  }
  renderCharts(): void {
    // Loop through each exception and render a chart for each
    this.exceptionsTableData.forEach((exception, index) => {
      const chartId = `#chart-DEST-${index}`;
      const categories = exception.monthlyTotals.map((item) => item[0]); // Extract X-axis categories
      const dataValues = exception.monthlyTotals.map((item) => Number(item[1])); // Extract Y-axis data

      // Get the maximum value from the dataset
      const maxValue = Math.max(...dataValues);

      // Replace 0 values with the max value for rendering purposes
      const adjustedDataValues = dataValues.map((value) =>
        value === 0 ? maxValue : value
      );

      // Generate the C3.js chart
      const chart = c3.generate({
        bindto: chartId,
        size: {
          height: 70, // Compact chart height
          width: 300, // Compact chart width
        },
        data: {
          columns: [[" ", ...adjustedDataValues]],
          type: "bar",
          classes: {
            " ": function (d) {
              return dataValues[d.index] === 0 ? "dotted-bar" : "normal-bar";
            },
          },
          colors: {
            " ": "#C1C3C3", // Set bar color explicitly
          },
          onmouseover: function (d) {
            // Skip hover effect for dotted bars (value 0)
            if (dataValues[d.index] === 0) return;

            // Find the specific bar element based on the index
            d3.select(`${chartId} .c3-bars .c3-bar-${d.index}`)
              .transition()
              .duration(200) // Smooth transition
              .style("fill", "var(--primary-40, #4682B4)") // Change color to blue
              .style("opacity", 1); // Ensure full opacity
            // Ensure no stroke is applied on hover
            d3.selectAll(".c3-bar")
              .style("stroke", "none")
              .style("outline", "none");
          },
          onmouseout: function (d) {
            // Skip hover effect for dotted bars (value 0)
            if (dataValues[d.index] === 0) return;

            // Revert the color of the specific bar element to black
            d3.select(`${chartId} .c3-bars .c3-bar-${d.index}`)
              .transition()
              .duration(200)
              .style("fill", "#333") // Revert to black
              .style("opacity", 1); // Ensure full opacity
          },
        },
        bar: {
          width: {
            ratio: 0.5, // Adjust bar width
          },
          // zerobased: true
        },
        axis: {
          x: {
            type: "category",
            categories: categories, // X-axis categories
            show: false, // Hide X-axis for minimalistic design
          },
          y: {
            show: false, // Hide Y-axis for simplicity
          },
        },
        legend: {
          show: false, // Hide legend
        },
        tooltip: {
          contents: function (
            d,
            defaultTitleFormat,
            defaultValueFormat,
            color
          ) {
            // Check if an existing tooltip is present
            let existingTooltip = document.querySelector(
              ".custom-tooltip"
            ) as HTMLElement;

            // If tooltip exists, update its content and position
            if (existingTooltip) {
              const index = d[0].index;
              const title = categories[index];
              const value1 = dataValues[index] === 0 ? 0 : d[0]["value"];
              existingTooltip.innerHTML = `
                <div class="tooltip-title">${title}</div>
                <div class="tooltip-value">${value1}</div>
              `;

              // Update tooltip position dynamically
              const mousePosition = d3.event;
              existingTooltip.style.left = `${mousePosition.pageX + 10}px`;
              existingTooltip.style.top = `${mousePosition.pageY - 40}px`; // Position above

              return ""; // Return empty to prevent default tooltip behavior
            }

            // If no tooltip exists, create a new one
            const tooltipDiv = document.createElement("div");
            tooltipDiv.className = "custom-tooltip";
            tooltipDiv.style.position = "absolute";
            tooltipDiv.style.zIndex = "1000";
            tooltipDiv.style.pointerEvents = "none";
            document.body.appendChild(tooltipDiv);

            // Populate tooltip content
            const index = d[0].index;
            const title = categories[index];
            const value1 = dataValues[index] === 0 ? 0 : d[0]["value"];
            tooltipDiv.innerHTML = `
              <div class="tooltip-title">${title}</div>
              <div class="tooltip-value">${value1}</div>
            `;

            // Position tooltip dynamically
            const mousePosition = d3.event;
            // tooltipDiv.style.left = `${mousePosition.pageX -10}px`;
            // tooltipDiv.style.top = `${mousePosition.pageY-30}px`; // Position above

            return ""; // Return empty to prevent default tooltip behavior
          },
        },

        onmouseout: function () {
          // Remove the tooltip when the mouse leaves
          const existingTooltip = document.querySelector(
            ".custom-tooltip"
          ) as HTMLElement;
          if (existingTooltip) {
            existingTooltip.remove();
          }
        },
        transition: {
          duration: 0, // Disable transitions during resize
        },
        onrendered: function () {
          // Apply custom styles for bars
          const bars = Array.from(
            document.querySelectorAll(`${chartId} .c3-bar`)
          );
          bars.forEach((bar, idx) => {
            const barElement = bar as HTMLElement; // Cast to HTMLElement
            if (dataValues[idx] === 0) {
              // Styling for dotted bars
              barElement.classList.add("dotted-bar");
              barElement.style.strokeDasharray = "3, 3"; // Dashed border
              barElement.style.strokeWidth = "0.5px";
              // barElement.style.stroke = "var(--text-color-disabled, #C9D0D6)";
              // barElement.style.fill = "var(--surface-background-10, #F0F4F8)";
            } else {
              barElement.style.fill = "#333"; // Set default color for normal bars
            }
          });

          // Avoid resetting styles during hover by ensuring hover styles remain
          const hoverBars = d3.select(chartId).selectAll(".c3-bar");
          hoverBars.on("mouseover", function (event, d) {
            if (dataValues[d.index] !== 0) {
              d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "var(--primary-40, #4682B4)");
            }
          });
          hoverBars.on("mouseout", function (event, d) {
            if (dataValues[d.index] !== 0) {
              d3.select(this).transition().duration(200).style("fill", "#333");
            }
          });
        },
      });
    });
  }

  ngAfterViewInit() {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
           .custom-tooltip {
            background-color: #333; /* Tooltip background color */
            color: white; /* Text color */
            border: 1px solid #323232;
            border-radius: 5px;
            padding: 5px 10px;
            position: absolute;
            pointer-events: none;
            transform: translate(-50%, -100%);
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
          }

           .custom-tooltip::before {
              content: "";
              position: absolute;
              top: 100%;
              left: 48%;
              transform: translateX(-50%);
              border-width: 10px;
              border-style: solid;
              border-color: #333 transparent transparent transparent; /* Arrow color */
              z-index: 9999;
            }

            .custom-tooltip .tooltip-title {
                font-weight: bold;
                color: #fffff;
                margin-bottom: 5px;
                color: #989898;
                font-size: 16px;
                font-style: normal;
                font-weight: 600;
                line-height: normal;
                letter-spacing: -0.36px;
            }
            .custom-tooltip .tooltip-value {
                font-size: 16px;
                color: #ffff;
            }
          `;
    document.head.appendChild(style);
    // Attach resize event listener
    window.addEventListener("resize", this.handleResize.bind(this));
  }
  handleResize(): void {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.renderCharts(); // Re-render charts with updated sizes
    }, 300); // Debounce time in milliseconds
  }
  exceptionLaneGraph(payLoad) {
    this.appService.exceptionsLaneGraph(payLoad).subscribe((res: any) => {
      if (res) {
        this.lanes = res;
      }
    });
  }
  // Cleanup on destroy
  ngOnDestroy() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }
}
