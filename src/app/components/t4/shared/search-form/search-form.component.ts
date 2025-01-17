import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { debounceTime, finalize } from "rxjs/operators";
import { ISubscription } from "rxjs/Subscription";
import { AuthGuard } from "../../../../guards/auth.guard";
import { AppService } from "../../../../app.service";
import { UtilService } from "../../../../services/util.service";
import { SearchService } from "../../../../services/search.service";
import { DirectivesAnimation } from "../../../../animations/animations";

@Component({
  selector: "app-search-form",
  animations: DirectivesAnimation,
  templateUrl: "./search-form.component.html",
  styleUrls: ["./search-form.component.scss"],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFormComponent implements OnInit, AfterViewInit {
  @HostBinding("class") class = "autoFlexColumn";
  @ViewChild("dropdown") dropdown: ElementRef;
  MULTI_SELECT_SETTINGS = {
    text: "Select",
    enableSearchFilter: true,
    lazyLoading: true,
    badgeShowLimit: 1,
    autoPosition: false,
    classes: "myclass custom-class-example",
  };
  SINGLE_SELECT_SETTINGS = {
    lazyLoading: true,
    badgeShowLimit: 1,
    autoPosition: false,
    singleSelection: true,
    enableSearchFilter: true,
    enableCheckAll: false,
    enableFilterSelectAll: false,
    showCheckbox: false,
    classes: "myclass custom-class-example",
  };
  CLIENT_FILTER_SETTINGS = {
    ...this.SINGLE_SELECT_SETTINGS,
    lazyLoading: false,
    // clearAll: false,
  };

  INTENSITY_TAB: string = "intensity";
  CLIENT_CODE_FILTER_KEY: string = "clientCode";
  INTENSITY_FILTER_KEY: string = "intensityFilter";

  REQ_PAYLOAD: any = { platform: "T4" };

  hasFpsAccess: boolean = false;
  accessInfoSub$: ISubscription;

  isIntensityTab: boolean = false;
  tabChangeSub$: ISubscription;

  userId: string = "";
  clientCodesList: any[] = [];
  userDataSub$: ISubscription;

  isFiltersInitialized: boolean = false;
  standardFiltersList: any[] = [];
  customFiltersList: any[] = [];
  isFilterValuesSearching: boolean = false;
  filterValues: any[] = [];
  filterValuesToken: string = "";
  filterValuesSearchText: string = "";
  filterSearchInput = new Subject<string>();

  searchForm: FormGroup = new FormGroup({});

  showPopup: boolean = false;
  isClientUpdated: string;
  selectedClientCode: any;
  isApplyDisabled: boolean = false;
  filterType: string;

  constructor(
    private router: Router,
    private authGuard: AuthGuard,
    private appService: AppService,
    private searchService: SearchService,
    private utilService: UtilService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {
    this.filterSearchInput
      .pipe(debounceTime(300))
      .subscribe((filterKey: string) => {
        this.clearFilterValuesAndToken();
        this.fetchFilterValues(filterKey, false, this.filterType);
      });
  }

  ngOnInit() {
    this.accessInfoSub$ = this.authGuard.getAccessInfo.subscribe(
      (info: any) => {
        this.hasFpsAccess = info && info.fpsAccess === true;
      }
    );

    this.tabChangeSub$ = this.searchService.getCurrentT4Tab$.subscribe(
      (val: string) => {
        this.isIntensityTab = val === "intensity";
      }
    );

    this.userDataSub$ = this.searchService.getUserData$.subscribe(
      (data: any) => {
        const { userId = "", clientCodes = [] } = data || {};

        if (userId && clientCodes && clientCodes.length > 0) {
          this.userId = userId;
          this.clientCodesList =
            this.utilService.formatValueForDropdown(clientCodes);
          this.fetchFiltersToDisplay(this.clientCodesList[0]["id"]);
        }
      }
    );
    this.cdr.detectChanges();
  }
  clientSelect(clientData) {
    this.isClientUpdated = "clientUpdated";
    this.selectedClientCode = clientData["id"];
    this.isApplyDisabled = false;
    this.fetchFiltersToDisplay(clientData["id"], "clientUpdated");
  }
  ngAfterViewInit(): void {
    if (this.dropdown && this.dropdown.nativeElement) {
      const dropdownList = this.dropdown.nativeElement.querySelector(".c-list");
      if (dropdownList) {
        this.renderer.listen(
          dropdownList,
          "scroll",
          this.scrollEvents.bind(this)
        );
        this.cdr.detectChanges();
      }
    }

    this.cdr.detectChanges();
  }
  fetchFiltersToDisplay(clientCode?, clientChange?, resetData?) {
    this.appService
      .getFiltersToDisplay(clientCode)
      .pipe(
        finalize(() => {
          if (resetData !== "reset") {
            this.initializeForm(clientChange, clientCode);
          }
        })
      )
      .subscribe((res: any) => {
        const { standardFilters = [], customFilters = [] } = res || {};
        this.standardFiltersList = standardFilters || [];
        this.customFiltersList = customFilters || [];
      });
  }

  initializeForm(clientChange?, clientCode?) {
    const {
      clientCodesList,
      CLIENT_CODE_FILTER_KEY,
      standardFiltersList,
      customFiltersList,
    } = this;
    const defaultClient =
      clientCodesList.length > 0 ? [clientCodesList[0]] : [];

    const searchStandardFormGroup: any = {};
    const searchCustomFormGroup1: any = {};
    searchStandardFormGroup[CLIENT_CODE_FILTER_KEY] = new FormControl(
      defaultClient,
      Validators.required
    );
    [...standardFiltersList].forEach((item: any) => {
      searchStandardFormGroup[item.key] = new FormControl([]);
    });
    [...customFiltersList].forEach((item: any) => {
      searchCustomFormGroup1[item.key] = new FormControl([]);
    });
    this.searchForm = new FormGroup({
      searchStandardFormGroup: new FormGroup(searchStandardFormGroup),
      searchCustomFormGroup1: new FormGroup(searchCustomFormGroup1),
    });
    this.isFiltersInitialized = true;
    if (clientChange === "clientUpdated") {
      this.searchForm
        .get("searchStandardFormGroup")
        .get("clientCode")
        .setValue([{ id: clientCode, itemName: clientCode }]);
    }
    this.fetchFilterValues("showBy", false, "standard", "initialLoad");
    this.fetchFilterValues("monthYear", false, "standard", "initialLoad");
  }

  clearFilterValuesAndToken() {
    this.filterValuesToken = "";
    this.filterValues = [];
  }

  /**
   * Client code is always required and it is not supposed to be deSelected.
   * But the library deSelects an option if user clicks on that option again (Library limitation).
   * As a workaround, when an item is deSelected, the form value for client is updated again with the deSelected value.
   * @param item - DeSelected item.
   */
  onClientDeSelect(item: any) {
    this.searchForm.controls[this.CLIENT_CODE_FILTER_KEY].setValue([item]);
  }

  onFilterOpen(event: any, filterKey: string, filterType: string) {
    this.clearFilterValuesAndToken();
    this.filterValuesSearchText = "";this.filterType = "";
    this.filterType = filterType;
  }
  scrollEvents(event) {
    //     const scrollTop = event.target.scrollTop;
    //     const scrollHeight = event.target.scrollHeight;
    //     const offsetHeight = event.target.offsetHeight;
    //     if (scrollTop + offsetHeight >= scrollHeight) {
    //       this.onFilterValuesScrollToEnd(event, "yourFilterKey"); // Adjust the key as necessary
    //     }
  }

  onFilterValuesScrollToEnd(event: any, filterKeys, filterType?) {
    const filterKey = filterKeys.key;
    this.filterType = filterType;
    const { isFilterValuesSearching, filterValues, filterValuesToken } = this;
    const { startIndex, endIndex, scrollEndPosition } = event;
    // alert(1)
    // If no filter values API call is on-going & if filter is in opened state.
    if (!isFilterValuesSearching && scrollEndPosition > 0) {
      if (startIndex === -1) {
        // Fetch first set of values
        this.fetchFilterValues(filterKey, false, filterType);
      } else if (endIndex === filterValues.length - 1 && filterValuesToken) {
        // User scrolled to last item &  next page data is available
        this.fetchFilterValues(filterKey, true, filterType);
      }
    }
  }

  onFilterSearch(filterKey: string, filterType?) {
    console.log(filterType);
    this.filterType = filterType; // Update filterType here
    this.filterSearchInput.next(filterKey);
  }

  fetchFilterValues(
    filterKey: string,
    isLoadMore: boolean = false,
    filterType?,
    initialLoad?
  ) {
    this.isFilterValuesSearching = true;
    if (initialLoad) {
      this.filterValuesToken = "";
      this.filterValuesSearchText = "";
    }
    const {
      searchForm,
      CLIENT_CODE_FILTER_KEY,
      filterValuesToken,
      filterValuesSearchText,
    } = this;
    const clientCodeField = searchForm
      .get("searchStandardFormGroup")
      .get(CLIENT_CODE_FILTER_KEY).value;
    const userSelectedClientCode =
      clientCodeField.length > 0
        ? clientCodeField[0][this.utilService.DROPDOWN_KEY]
        : "";

    this.appService
      .getFilterValues(
        filterKey,
        userSelectedClientCode,
        filterValuesToken,
        filterValuesSearchText,
        filterType
      )
      .pipe(
        finalize(() => {
          this.isFilterValuesSearching = false;
          // this.filterType = "";
          this.utilService.resetDropdownPosition();
        })
      )
      .subscribe((res: any) => {
        if (res.data.length) {
          const { data = [], token = "" } = res || {};
          const newFilterValues = this.utilService.formatValueForDropdown(data);
          this.filterValues = isLoadMore
            ? this.filterValues.concat(newFilterValues)
            : newFilterValues;
          this.filterValuesToken = token;
          this.filterType = "";
          this.isFilterValuesSearching = true;
          if (initialLoad === "initialLoad" && filterKey === "showBy") {
            console.log([this.filterValues[0]]);
            this.searchForm
              .get("searchStandardFormGroup")
              .get("showBy")
              .setValue([this.filterValues[0]]);
          }
          if (initialLoad === "initialLoad" && filterKey === "monthYear") {
            this.searchForm
              .get("searchStandardFormGroup")
              .get("monthYear")
              .setValue(this.filterValues);
          }
          if (
            this.searchForm.get("searchStandardFormGroup").get("monthYear")
              .value &&
            this.searchForm.get("searchStandardFormGroup").get("showBy")
              .value &&
            initialLoad === "initialLoad"
          ) {
            this.onSearch();
          }
        } else {
          this.isFilterValuesSearching = false;
          // this.utilService.resetDropdownPosition();
          if (
            !this.searchForm.get("searchStandardFormGroup").get("monthYear")
              .value.length &&
            !this.searchForm.get("searchStandardFormGroup").get("showBy").value
              .length &&
            initialLoad === "initialLoad"
          ) {
            this.onSearch();
          }
        }
      });
  }

  refreshFilters(clientData) {
    this.showPopup = false;
    this.selectedClientCode = clientData;
    this.fetchFiltersToDisplay(this.selectedClientCode, this.isClientUpdated);
  }

  onNavigate() {
    this.router.navigateByUrl("/fps");
  }

  onReset() {
    this.isFiltersInitialized = false;
    this.searchForm.reset();
    this.initializeForm();
    this.fetchFiltersToDisplay(this.clientCodesList[0]["id"], "", "reset");
  }

  togglePopup() {
    this.showPopup = !this.showPopup;
  }

  onSearch() {
    this.isApplyDisabled = true;
    this.searchService.setSearchParams(
      this.utilService.formatT4SearchPayload(this.searchForm.value)
    );
  }

  countFilters() {
    let count = 0;

    // Count filters in searchStandardFormGroup
    if (this.searchForm.value["searchStandardFormGroup"]) {
      Object.values(this.searchForm.value["searchStandardFormGroup"]).forEach(
        (value) => {
          if (Array.isArray(value) && value.length > 0) {
            count++;
          }
        }
      );
    }

    // Count filters in searchCustomFormGroup1
    if (this.searchForm.value["searchCustomFormGroup1"]) {
      Object.values(this.searchForm.value["searchCustomFormGroup1"]).forEach(
        (value) => {
          if (Array.isArray(value) && value.length > 0) {
            count++;
          }
        }
      );
    }

    return count;
  }
  onFiltersSelect(event, data) {
    console.log(event, data);
    this.isApplyDisabled = false;
    this.isClientUpdated = "";
  }
  onDeSelectAll(event, filter, filterType) {
    if (filter.key === "showBy") {
      this.searchForm
        .get("searchStandardFormGroup")
        .get("showBy")
        .setValue([{ id: "OPS", itemName: "OPS" }]);
    }
    this.isApplyDisabled = false;
    this.isClientUpdated = "";
  }
  onDropdownClose(event, filter, filterType) {
    if (filterType === "standard" && filter.key === "showBy") {
      console.log(
        this.searchForm.get("searchStandardFormGroup").get("showBy").value
      );
      if (
        this.searchForm.get("searchStandardFormGroup").get("showBy").value
          .length === 0
      ) {
        this.searchForm
          .get("searchStandardFormGroup")
          .get("showBy")
          .setValue([{ id: "OPS", itemName: "OPS" }]);
      }
    }
  }
  ngOnDestroy() {
    if (this.accessInfoSub$) this.accessInfoSub$.unsubscribe();
    if (this.tabChangeSub$) this.tabChangeSub$.unsubscribe();
    if (this.userDataSub$) this.userDataSub$.unsubscribe();
    if (this.filterSearchInput) this.filterSearchInput.complete();
  }
}
