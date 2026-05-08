import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ApiDataResponse,
    ApiListResponse,
    ApiMessageResponse,
    OpeningStockListFilters,
    OpeningStockRecord,
    OpeningStockRefreshData,
} from '../pages/opening-stock/opening-stock.models';

@Injectable({
    providedIn: 'root'
})

export class OpeningStockService {
    API_BASE_URL = 'https://api2023.zerolite.in';

    constructor(private http: HttpClient) { }

    refresh(): Observable<OpeningStockRefreshData> {
        const url = `${this.API_BASE_URL}/api/opening_stock/refresh`;
        return this.http.get(url);
    }

    deleteOpeningStock(srno: number): Observable<ApiMessageResponse> {
        return this.http.delete(`${this.API_BASE_URL}/api/opening_stock/delete/${srno}`);
    }

    list(filters: OpeningStockListFilters = {}): Observable<ApiListResponse<OpeningStockRecord>> {
        const dateRange = this.dateRangeFilter(filters.dateRange?.from, filters.dateRange?.to);

        const subloc = this.pathFilter(filters.subloc);
        const modelNo = this.pathFilter(filters.modelNo);
        const productCategory = this.pathFilter(filters.productCategory);
        const productType = this.pathFilter(filters.productType);

        const spare = filters.spare === null || filters.spare === undefined || filters.spare === '' ? 'NA' : filters.spare;

        const url = `${this.API_BASE_URL}/api/opening_stock/opening_stock_PageList/` +
            `${dateRange}-${subloc}-${modelNo}-${productCategory}-${productType}-${spare}`;

        const body = {
            searchString: '',
            text1: this.bodyFilter(filters.billNo),
            text2: this.bodyFilter(filters.productName),
            text3: this.bodyFilter(filters.supplier),
            text4: this.bodyFilter(filters.location),
            pageNo: filters.pageNo || 1,
            pageSize: filters.pageSize || 10,
            sortField: 11
        };

        return this.http.post(url, body);
    }

    getById(srno: number): Observable<ApiDataResponse<OpeningStockRecord>> {
        const url = `${this.API_BASE_URL}/api/opening_stock/getbyid/${srno}`;
        return this.http.get(url);
    }

    save(data: Partial<OpeningStockRecord>): Observable<ApiMessageResponse> {
        const today = this.getTodayDate();
        const body: any = {};
        for (const key of Object.keys(data || {})) {
            if (!key.startsWith('ret_')) {
                body[key] = data[key];
            }
        }

        body.product_img = this.getFileExtension(body.product_img);
        body.purchase_img = this.getFileExtension(body.purchase_img);

        body.purchase_date = this.formatApiDate(body.purchase_date) || today;

        body.mfg_date = this.formatApiDate(body.mfg_date) || today;

        body.srno = body.srno || 0;
        body.status = body.status ?? 0;
        body.is_product_spare = body.is_product_spare ?? 0;
        body.qty = body.qty ?? 0;
        body.mrp = body.mrp ?? 0;
        body.purchase_rate = body.purchase_rate ?? 0;
        body.stock = body.stock ?? 0;
        body.created_user_id = 0;
        body.updated_user_id = 0;
        body.bm_srno = 0;
        body.disID = 0;
        body.created_dt = today;
        body.updated_dt = today;
        const url = `${this.API_BASE_URL}/api/opening_stock/save`;
        return this.http.post(url, body);
    }

    formatDate(date: any): string {
        if (!date) return '';

        if (typeof date === 'string') {
            const normalized = date.trim();
            const dateOnly = normalized.match(/^(\d{4})[-_/](\d{2})[-_/](\d{2})/);
            if (dateOnly) {
                return `${dateOnly[1]}_${dateOnly[2]}_${dateOnly[3]}`;
            }
        }
        
        let newDate: Date;
        
        if (date instanceof Date) {
            newDate = date;
        } else if (typeof date === 'string') {
            // Handle string dates (yyyy-mm-dd format from datepicker)
            newDate = new Date(date);
        } else {
            // Handle any other format
            newDate = new Date(date);
        }
        
        // Check if date is valid
        if (isNaN(newDate.getTime())) {
            return '';
        }
        
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1)
            .padStart(2, '0');
        const day = String(newDate.getDate())
            .padStart(2, '0');
        return `${year}_${month}_${day}`;
    }

    dateRangeFilter(from?: Date | string | null, to?: Date | string | null): string {
        if (!from && !to) {
            return 'NA';
        }

        const fromDate = this.formatDate(from || to);
        const toDate = this.formatDate(to || from);
        if (!fromDate || !toDate) {
            return 'NA';
        }

        return `%27${fromDate}%27%20and%20%27${toDate}%27`;
    }

    pathFilter(value: unknown): string {
        const normalized = String(value ?? '').trim();
        return normalized ? encodeURIComponent(normalized) : 'NA';
    }

    bodyFilter(value: unknown): string {
        const normalized = String(value ?? '').trim();
        return normalized || 'NA';
    }

    getTodayDate(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1)
            .padStart(2, '0');
        const day = String(today.getDate())
            .padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
    }

    formatApiDate(date: any): string {

        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1)
                .padStart(2, '0');
            const day = String(date.getDate())
                .padStart(2, '0');

            return `${year}-${month}-${day}T00:00:00`;
        }

        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return `${date}T00:00:00`;
        }

        return '';
    }

    getFileExtension(fileName: string): string {
        if (!fileName) {
            return '';
        }
        const dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0
            ? fileName.slice(dotIndex).toLowerCase()
            : fileName;
    }
}
