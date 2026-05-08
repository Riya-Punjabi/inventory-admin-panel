import { ChangeDetectorRef, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { OpeningStockService } from '../../services/opening-stock.service';
import {
  OpeningStockRecord,
  OpeningStockRefreshData,
  RefreshOption,
} from './opening-stock.models';

interface OpeningStockSuggestions {
  productName: string[];
  supplier: string[];
  location: string[];
  subloc: string[];
  modelNo: string[];
  productCategory: string[];
  productType: string[];
  [key: string]: string[];
}

interface AddEditOpeningStockSuggestions {
  location: string[];
  sub_location: string[];
  supplier: string[];
  product_name: string[];
  part_name: string[];
  model_no: string[];
  product_category: string[];
  product_type: string[];
  company: string[];
  [key: string]: string[];
}

@Component({
  selector: 'app-opening-stock',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, AutoCompleteModule, ButtonModule, DatePickerModule, SelectModule, TableModule, ConfirmDialogModule],
  templateUrl: './opening-stock.html',
  styleUrl: './opening-stock.css',
})
export class OpeningStock {
  filters!: FormGroup;
  records: OpeningStockRecord[] = [];
  totalRecords = 0;
  first = 0;
  pageNo = 1;
  pageSize = 10;
  refreshData: OpeningStockRefreshData | null = null;
  error = '';
  pageSizeOptions = [10, 25, 50];
  spareOptions = [
    { label: 'All', value: 'NA' },
    { label: 'YES', value: 0 },
    { label: 'NO', value: 1 },
  ];
  suggestions: OpeningStockSuggestions = {
    productName: [],
    supplier: [],
    location: [],
    subloc: [],
    modelNo: [],
    productCategory: [],
    productType: [],
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly openingStockService: OpeningStockService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
  ) {
    this.filters = this.fb.group({
      dateRange: [null],
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
    if (this.hasIncompleteDateRange(values.dateRange)) {
      this.error = 'Please select both from and to dates.';
      this.cdr.detectChanges();
      return;
    }

    const dateRange = this.selectedDateRange(values.dateRange);
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.first = (pageNo - 1) * pageSize;
    this.error = '';

    this.openingStockService
      .list({
        dateRange,
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
    const values = this.filters.getRawValue();
    if (this.hasIncompleteDateRange(values.dateRange)) {
      this.error = 'Please select both from and to dates.';
      return;
    }

    const dateRange = this.selectedDateRange(values.dateRange);
    if (dateRange.from && dateRange.to && this.toDate(dateRange.from) > this.toDate(dateRange.to)) {
      this.error = 'From date cannot be greater than to date.';
      return;
    }

    this.error = '';
    this.load(1, this.pageSize);
  }

  pageChanged(event: { first?: number; rows?: number }): void {
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
    this.filters.reset({
      dateRange: null,
      subloc: '',
      modelNo: '',
      productCategory: '',
      productType: '',
      spare: 'NA',
      billNo: '',
      productName: '',
      supplier: '',
      location: '',
    });
    this.search();
  }

  complete(field: string, event: { query?: string }): void {
    const query = String(event.query || '').toLowerCase();
    this.suggestions[field] = this.getOptions(field)
      .filter((item: string) => item.toLowerCase().includes(query))
      .slice(0, 20);
  }

  statusName(status?: number): string {
    const list = this.refreshData?.data1 || [];
    const item = list.find((x: RefreshOption) => x.srno === status);
    return item?.status_name || 'Open';
  }

  spareLabel(value?: number): string {
    return value === 1 ? 'NO' : 'YES';
  }

  confirmDelete(srno?: number): void {
    if (!srno) {
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteRecord(srno);
      },
    });
  }

  deleteRecord(srno: number): void {
    this.openingStockService.deleteOpeningStock(srno).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: res?.message || 'Record deleted successfully',
          life: 2000,
        });
        this.load();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: err?.error?.message || 'Something went wrong',
          life: 2000,
        });
      },
    });
  }

  private getOptions(field: string): string[] {
    const map: Record<string, [keyof OpeningStockRefreshData, keyof RefreshOption]> = {
      productName: ['data4', 'product_name'],
      supplier: ['data10', 'supplier'],
      location: ['data2', 'location'],
      subloc: ['data3', 'sub_location'],
      modelNo: ['data9', 'model_no'],
      productCategory: ['data6', 'product_category'],
      productType: ['data7', 'product_type'],
    };
    const setting = map[field];
    if (!setting) {
      return [];
    }

    const values = (this.refreshData?.[setting[0]] || [])
      .map((item: RefreshOption) => String(item[setting[1]] || '').trim())
      .filter((x: string) => x);
    return [...new Set(values)];
  }

  private toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private selectedDateRange(value: unknown): { from: Date | string | null; to: Date | string | null } {
    if (!Array.isArray(value)) {
      return { from: null, to: null };
    }

    const from = value[0] ?? null;
    const to = value[1] ?? null;
    return { from, to };
  }

  private hasIncompleteDateRange(value: unknown): boolean {
    if (!Array.isArray(value)) {
      return false;
    }

    return Boolean(value[0]) !== Boolean(value[1]);
  }
}

@Component({
  selector: 'app-add-edit-opening-stock',
  imports: [ReactiveFormsModule, RouterLink, AutoCompleteModule, ButtonModule, DatePickerModule, InputNumberModule, InputTextModule, SelectModule, TextareaModule, ToastModule],
  templateUrl: './add-edit-opening-stock/add-edit-opening-stock.html',
  styleUrl: './add-edit-opening-stock/add-edit-opening-stock.css',
})
export class AddEditOpeningStock {
  form!: FormGroup;
  loading = false;
  editSrno: number | null = null;
  refreshData: OpeningStockRefreshData | null = null;
  productImagePreview = '';
  purchaseImagePreview = '';

  spareOptions = [
    { label: 'YES', value: 0 },
    { label: 'NO', value: 1 },
  ];

  suggestions: AddEditOpeningStockSuggestions = {
    location: [],
    sub_location: [],
    supplier: [],
    product_name: [],
    part_name: [],
    model_no: [],
    product_category: [],
    product_type: [],
    company: [],
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly openingStock: OpeningStockService,
    private readonly messages: MessageService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      srno: [0],
      status: [0],
      location: [''],
      sub_location: [''],
      supplier: [''],
      purchase_date: [new Date(), Validators.required],
      purchase_ref_no: [''],
      product_name: ['', Validators.required],
      part_name: [''],
      barcode: [''],
      model_no: [''],
      product_category: [''],
      product_type: [''],
      is_product_spare: [0],
      qty: [1, [Validators.required, Validators.min(0)]],
      mfg_date: [new Date()],
      pcondition: [''],
      company: [''],
      serial_no1: [''],
      serial_no2: [''],
      mrp: [0],
      purchase_rate: [0],
      product_img: [''],
      product_imgBase64: [''],
      purchase_img: [''],
      purchase_imgBase64: [''],
      note: [''],
    });
  }

  ngOnInit(): void {
    const srno = Number(this.route.snapshot.paramMap.get('srno'));
    this.editSrno = Number.isFinite(srno) && srno > 0 ? srno : null;

    this.openingStock.refresh().subscribe({
      next: (response) => {
        this.refreshData = response;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });

    if (this.editSrno) {
      this.loadRecord(this.editSrno);
    }
  }

  complete(field: string, event: { query?: string }): void {
    const query = String(event.query || '').toLowerCase();
    this.suggestions[field] = this.optionValues(field)
      .filter((value: string) => value.toLowerCase().includes(query))
      .slice(0, 20);
  }

  statusOptions(): { label: string; value: number | undefined }[] {
    return (this.refreshData?.data1 || []).map((item: RefreshOption) => ({
      label: item.status_name || 'Open',
      value: item.srno,
    }));
  }

  handleFile(event: Event, imageField: string, base64Field: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const values: Record<string, string> = {};
      values[imageField] = file.name;
      values[base64Field] = result.includes(',') ? result.split(',')[1] : result;
      this.form.patchValue(values);
      this.setImagePreview(imageField, result);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.openingStock.save(this.form.getRawValue())
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: (response) => {
          if (!response?.issuccess) {
            this.messages.add({
              severity: 'error',
              summary: 'Save Failed',
              detail: response?.message || 'Unable to save opening stock',
              life: 2000,
            });
            this.cdr.detectChanges();
            return;
          }

          this.messages.add({
            severity: 'success',
            summary: 'Saved',
            detail: response.message || 'Stock saved successfully',
            life: 2000,
          });
          this.router.navigate(['/admin/opening-stock']);
        },
        error: (err) => {
          this.messages.add({
            severity: 'error',
            summary: 'Server Error',
            detail: err?.error?.message || 'Something went wrong while saving',
            life: 2000,
          });
          this.cdr.detectChanges();
        },
      });
  }

  private loadRecord(srno: number): void {
    this.loading = true;
    this.openingStock
      .getById(srno)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          const record = response.data;
          if (!response.issuccess || !record) {
            this.cdr.detectChanges();
            return;
          }

          this.form.patchValue({
            ...record,
            purchase_date: this.toDate(record.purchase_date),
            mfg_date: this.toDate(record.mfg_date),
          });
          this.productImagePreview = this.imageSrc(record.product_img, record.product_imgBase64);
          this.purchaseImagePreview = this.imageSrc(record.purchase_img, record.purchase_imgBase64);
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        },
      });
  }

  private optionValues(field: string): string[] {
    const map: Record<string, [keyof OpeningStockRefreshData, keyof RefreshOption]> = {
      location: ['data2', 'location'],
      sub_location: ['data3', 'sub_location'],
      product_name: ['data4', 'product_name'],
      part_name: ['data5', 'part_name'],
      product_category: ['data6', 'product_category'],
      product_type: ['data7', 'product_type'],
      company: ['data8', 'company'],
      model_no: ['data9', 'model_no'],
      supplier: ['data10', 'supplier'],
    };

    const setting = map[field];
    if (!setting) {
      return [];
    }

    return (this.refreshData?.[setting[0]] || [])
      .map((item: RefreshOption) => String(item[setting[1]] || '').trim())
      .filter((value: string) => !!value);
  }

  private imageSrc(fileName?: string, base64?: string): string {
    const value = String(fileName || '').trim();
    const imageBase64 = String(base64 || '').trim();
    if (imageBase64) {
      return imageBase64.startsWith('data:') ? imageBase64 : `data:image/*;base64,${imageBase64}`;
    }
    if (/^(https?:\/\/|data:image\/)/i.test(value)) {
      return value;
    }
    return '';
  }

  private setImagePreview(imageField: string, source: string): void {
    if (imageField === 'product_img') {
      this.productImagePreview = source;
      return;
    }
    if (imageField === 'purchase_img') {
      this.purchaseImagePreview = source;
    }
  }

  private toDate(value: unknown): Date {
    const date = value instanceof Date ? value : new Date(String(value || new Date()));
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}
