import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class OpeningStockService {
    API_BASE_URL = 'https://api2023.zerolite.in';

    constructor(private http: HttpClient) { }

    refresh(): Observable<any> {
        const url = `${this.API_BASE_URL}/api/opening_stock/refresh`;
        return this.http.get(url);
    }

    deleteOpeningStock(srno: number) {
        return this.http.delete(`${this.API_BASE_URL}/api/opening_stock/delete/${srno}`);
    }

    list(filters: any = {}): Observable<any> {
        let dateRange = 'NA';
        if (filters.dateRange?.from && filters.dateRange?.to) {
            const fromDate = this.formatDate(filters.dateRange.from);
            const toDate = this.formatDate(filters.dateRange.to);
            dateRange = `${fromDate}_${toDate}`;
        }

        const subloc = filters.subloc || 'NA';
        const modelNo = filters.modelNo || 'NA';
        const productCategory = filters.productCategory || 'NA';
        const productType = filters.productType || 'NA';

        const spare = filters.spare === null || filters.spare === undefined || filters.spare === '' ? 'NA' : filters.spare;

        const url = `${this.API_BASE_URL}/api/opening_stock/opening_stock_PageList/` +
            `${dateRange}-${subloc}-${modelNo}-${productCategory}-${productType}-${spare}`;

        const body = {
            searchString: 'NA',
            text1: filters.billNo || 'NA',
            text2: filters.productName || 'NA',
            text3: filters.supplier || 'NA',
            text4: filters.location || 'NA',
            pageNo: filters.pageNo || 1,
            pageSize: filters.pageSize || 10,
            sortField: 11
        };

        return this.http.post(url, body);
    }

    getById(srno: number): Observable<any> {
        const url = `${this.API_BASE_URL}/api/opening_stock/getbyid/${srno}`;
        return this.http.get(url);
    }

    save(data: any): Observable<any> {
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
        const newDate = new Date(date);
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1)
            .padStart(2, '0');
        const day = String(newDate.getDate())
            .padStart(2, '0');
        return `${year}_${month}_${day}`;
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