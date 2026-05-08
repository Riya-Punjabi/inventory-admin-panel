import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { OpeningStockService } from '../../../services/opening-stock.service';
import { SerialNoService } from '../../../services/serial-no.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-add-edit-opening-stock',
  imports: [ReactiveFormsModule, RouterLink, AutoCompleteModule, ButtonModule, DatePickerModule, InputNumberModule, InputTextModule, SelectModule, TextareaModule, ToastModule],
  templateUrl: './add-edit-opening-stock.html',
  styleUrl: './add-edit-opening-stock.css',
})

export class AddEditOpeningStock {

  form!: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private openingStock: OpeningStockService, private serialNo: SerialNoService, private messages: MessageService, private cdr: ChangeDetectorRef, private router: Router) {
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

  loading = false;
  editSrno: number | null = null;
  refreshData: any = null;

  spareOptions = [
    { label: 'YES', value: 0 },
    { label: 'NO', value: 1 },
  ];

  suggestions: any = {
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

  complete(field: string, event: any): void {
    const query = String(event.query || '').toLowerCase();
    this.suggestions[field] = this.optionValues(field)
      .filter((value: string) => value.toLowerCase().includes(query))
      .slice(0, 20);
  }

  statusOptions(): any[] {
    return (this.refreshData?.data1 || []).map((item: any) => ({
      label: item.status_name,
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
      const values: any = {};
      values[imageField] = file.name;
      values[base64Field] = result.includes(',') ? result.split(',')[1] : result;
      this.form.patchValue(values);
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.openingStock.save(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (!response?.issuccess) {
            this.messages.add({
              severity: 'error',
              summary: 'Save Failed',
              detail: response?.message || 'Unable to save opening stock',
              life: 2000
            });

            this.cdr.detectChanges();
            return;
          }

          this.messages.add({
            severity: 'success',
            summary: 'Saved',
            detail: response.message || 'stock saved successfully',
            life: 2000
          });
          this.router.navigate(['/admin/opening-stock']);
        },

        error: (err) => {
          this.messages.add({
            severity: 'error',
            summary: 'Server Error',
            detail: err?.error?.message || 'Something went wrong while saving',
            life: 2000
          });

          this.cdr.detectChanges();
        }
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
          this.cdr.detectChanges();
        },
        error: () => {
          this.cdr.detectChanges();
        },
      });
  }

  private optionValues(field: string): string[] {
    const map: any = {
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

    const bucket = setting[0];
    const key = setting[1];
    return (this.refreshData?.[bucket] || [])
      .map((item: any) => item[key])
      .filter((value: string) => !!value);
  }

  private toDate(value: any): Date {
    const date = value instanceof Date ? value : new Date(value || new Date());
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}
