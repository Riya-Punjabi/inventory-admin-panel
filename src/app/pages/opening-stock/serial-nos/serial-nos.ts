import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { OpeningStockService } from '../../../services/opening-stock.service';
import { SerialNoService } from '../../../services/serial-no.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-serial-nos',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, DialogModule, InputNumberModule, InputTextModule, SelectModule, TableModule, ToastModule],
  templateUrl: './serial-nos.html',
  styleUrl: './serial-nos.css'
})

export class SerialNos {

  parentSrno: number = 0;
  refreshData: any = null;
  records: any[] = [];
  saving = false;
  dialogVisible = false;
  error = '';
  statusOptions: any[] = [{ label: 'All', value: 'NA' }];
  dialogStatusOptions: any[] = [];
  filterForm !: FormGroup;
  form !: FormGroup;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private openingStock: OpeningStockService, private serialNo: SerialNoService, private messages: MessageService, private cdr: ChangeDetectorRef) {
    this.parentSrno = Number(this.route.snapshot.paramMap.get('srno'));

    this.filterForm = this.fb.group({
      searchString: [''],
      status: ['NA'],
    });

    this.form = this.fb.group({
      srno: [0],
      os_srno: [this.parentSrno, Validators.required],
      status: [0],
      serial_no1: ['', Validators.required],
      serial_no2: [''],
      serial_img: [''],
      serial_imgBase64: [''],
      qty: [1],
    });

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.openingStock.refresh().subscribe({
        next: (response) => {
          this.refreshData = response;
          const statuses = (response.data1 || []).map((item: any) => ({
            label: item.status_name,
            value: item.srno,
          }));
          setTimeout(() => {
            this.dialogStatusOptions = statuses;
            this.statusOptions = [{ label: 'All', value: 'NA' }, ...statuses];
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.error = 'Unable to load status data.';
          this.cdr.detectChanges();
        },
      });
      this.load();
    });
  }

  statusName(status: any): string {
    const match = this.dialogStatusOptions.find((item: any) => item.value === status);
    return match?.label || String(status ?? 'Open');
  }

  load(): void {
    const values = this.filterForm.getRawValue();
    this.error = '';

    this.serialNo
      .list({
        parentSrno: this.parentSrno,
        status: values.status,
        searchString: values.searchString,
        pageNo: 1,
        pageSize: 25,
      })
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.records = [];
            this.cdr.detectChanges();
            return;
          }

          this.records = response.data || [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Unable to load serial numbers.';
          this.cdr.detectChanges();
        },
      });
  }

  openNew(): void {
    this.form.reset({
      srno: 0,
      os_srno: this.parentSrno,
      status: 0,
      serial_no1: '',
      serial_no2: '',
      serial_img: '',
      serial_imgBase64: '',
      qty: 1,
    });
    this.dialogVisible = true;
  }

  openEdit(record: any): void {
    this.serialNo.getById(record.srno).subscribe({
      next: (response) => {
        const latest = response.data || record;
        this.form.patchValue({
          srno: latest.srno || 0,
          os_srno: latest.os_srno || this.parentSrno,
          status: latest.status || 0,
          serial_no1: latest.serial_no1 || '',
          serial_no2: latest.serial_no2 || '',
          serial_img: latest.serial_img || '',
          serial_imgBase64: latest.serial_imgBase64 || '',
          qty: latest.qty || 1,
        });
        this.dialogVisible = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Unable to load serial number record.';
        this.cdr.detectChanges();
      },
    });
  }

  handleFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      this.form.patchValue({
        serial_img: file.name,
        serial_imgBase64: result.includes(',') ? result.split(',')[1] : result,
      });
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    this.serialNo
      .save(this.form.getRawValue())
      .pipe(finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          if (!response.issuccess) {
            this.error = response.message || 'Serial number save failed.';
            this.cdr.detectChanges();
            return;
          }

          this.messages.add({ severity: 'success', summary: 'Saved', detail: response.message || 'Serial number saved.', life: 2000 });
          this.dialogVisible = false;
          this.load();
        },
        error: () => {
          this.error = 'Serial number save failed.';
          this.cdr.detectChanges();
        },
      });
  }


} 

