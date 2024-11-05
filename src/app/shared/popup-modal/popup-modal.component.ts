import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "app-popup-modal",
  templateUrl: "./popup-modal.component.html",
  styleUrls: ["./popup-modal.component.scss"],
})
export class PopupModalComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() isPopupOpen: boolean;
  @Input() isHeader: boolean;
  @Input() title: any;
  @Input() totalCount: any;
  @Input() totalPages: any;
  @Output() closePopupClicked = new EventEmitter<boolean>();
  @Output() pageChange = new EventEmitter<{
    page: number;
    itemsPerPage: number;
  }>(); // Event for page change
  carrierHeader = ["Carrier Code", "Carrier Name", "Value"];
  laneHeader = ["Lane by Country", "Lane by City", "Value"];
  currentPage: number = 1;
  itemsPerPage: number = 20;
  constructor(private cd:ChangeDetectorRef) {}

  ngOnInit() {
    console.log(this.data);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      console.log("Updated data:", this.data); // This should now log new data when `data` changes
      this.cd.detectChanges(); // Manually trigger change detection
    }
  }
  closePopup() {
    this.closePopupClicked.emit(false);
  }
  getBarWidth(data, value: number): string {
    const maxValue = Math.max(...data.map((lane) => Number(lane.value)));
    const factor = 100 / maxValue;
    return value * factor + "%";
  }

  paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.data.slice(start, end);
  }

  pageNumbers(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChange.emit({
        page: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChange.emit({
        page: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.pageChange.emit({
      page: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page
    this.pageChange.emit({
      page: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    });
  }
  trackById(index: number, item: any): any {
    return item.id; // Use a unique identifier
  }
}
