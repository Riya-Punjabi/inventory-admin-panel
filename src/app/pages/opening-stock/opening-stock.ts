import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { OpeningStockService } from '../../services/opening-stock.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-opening-stock',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, AutoCompleteModule, ButtonModule, DatePickerModule, SelectModule, TableModule, ConfirmDialogModule],
  templateUrl: './opening-stock.html',
  styleUrl: './opening-stock.css',
})

export class OpeningStock {

  filters!: FormGroup;
  records: any[] = [];
  totalRecords = 0;
  first = 0;
  pageNo = 1;
  pageSize = 10;
  refreshData: any = null;
  error = '';
  pageSizeOptions = [10, 25, 50];
  spareOptions = [
    { label: 'All', value: 'NA' },
    { label: 'YES', value: 0 },
    { label: 'NO', value: 1 },
  ];
  suggestions: any = {
    productName: [],
    supplier: [],
    location: [],
    modelNo: [],
  };

  constructor(private readonly fb: FormBuilder, private readonly openingStockService: OpeningStockService, private readonly cdr: ChangeDetectorRef, private messageService: MessageService,
    private confirmationService: ConfirmationService) {
    this.filters = this.fb.group({
      from: [null],
      to: [null],
      subloc: [''],
      modelNo: [''],
      productCategory: [''],
      productType: [''],
      spare: ['NA'],
      billNo: [''],
      productName: [''],
      supplier: [''],
      location: [''],
    });
  }

  ngOnInit(): void {
    this.openingStockService.refresh().subscribe({
      next: (response) => {
        this.refreshData = response;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Unable to load autocomplete data.';
      },
    });
    setTimeout(() => this.load());
  }

  load(pageNo = this.pageNo, pageSize = this.pageSize): void {
    const values = this.filters.getRawValue();
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.first = (pageNo - 1) * pageSize;
    this.error = '';

    this.openingStockService
      .list({
        dateRange: { from: values.from, to: values.to },
        subloc: values.subloc,
        modelNo: values.modelNo,
        productCategory: values.productCategory,
        productType: values.productType,
        spare: values.spare,
        billNo: values.billNo,
        productName: values.productName,
        supplier: values.supplier,
        location: values.location,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          const data = response.data ?? [];
          this.records = data;
          this.totalRecords = response.totalRecords ?? data.length;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Unable to load opening stock records.';
        },
      });
  }

  search(): void {
    this.load(1, this.pageSize);
  }

  pageChanged(event: any): void {
    const first = event.first || 0;
    const rows = event.rows || this.pageSize;
    const pageNo = Math.floor(first / rows) + 1;
    this.load(pageNo, rows);
  }

  pageSizeChanged(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.load(1, value);
  }

  reset(): void {
    this.filters.patchValue({
      from: null,
      to: null,
      subloc: '',
      modelNo: '',
      productCategory: '',
      productType: '',
      spare: 'NA',
      billNo: '',
      productName: '',
      supplier: '',
      location: ''
    });

    this.search();
  }

  complete(field: string, event: any) {
    const query = event.query.toLowerCase();
    const values = this.getOptions(field);

    this.suggestions[field] = values.filter(
      (item: string) =>
        item.toLowerCase()
          .includes(query)
    );
  }

  statusName(status?: number) {
    const list = this.refreshData?.data1 || [];

    const item = list.find((x: any) => x.srno === status);

    return item
      ? item.status_name
      : 'Open';
  }

  spareLabel(value?: number): string {
    if (value === 1) {
      return 'NO';
    }
    return 'YES';
  }

  private getOptions(field: string): string[] {

    const map: any = {
      productName: {
        data: 'data4',
        key: 'product_name'
      },

      supplier: {
        data: 'data10',
        key: 'supplier'
      },

      location: {
        data: 'data2',
        key: 'location'
      },

      modelNo: {
        data: 'data9',
        key: 'model_no'
      }
    };

    const setting = map[field];

    const data =
      this.refreshData?.[
      setting.data
      ] || [];

    const values: string[] = data

      .map((item: any) =>
        String(item[setting.key] || '')
      ).filter((x: string) => x);

    return [...new Set(values)];
  }

  confirmDelete(srno: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',

      accept: () => {
        this.deleteRecord(srno);
      }
    });
  }

  deleteRecord(srno: number) {
    this.openingStockService.deleteOpeningStock(srno).subscribe({
      next: (res: any) => {

        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: res?.message || 'Record deleted successfully',
          life: 2000
        });

        this.load();
      },

      error: (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: err?.error?.message || 'Something went wrong',
          life: 2000
        });
      }
    });
  }


}
