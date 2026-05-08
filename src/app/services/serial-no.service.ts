import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class SerialNoService {
    API_BASE_URL = 'https://api2023.zerolite.in';

    constructor(private http: HttpClient) { }

    list(filters: any): Observable<any> {
        const body = {
            searchString: filters.searchString || 'NA',
            text1: String(filters.parentSrno),
            text2: filters.status === null || filters.status === undefined || filters.status === '' ? 'NA' : String(filters.status),
            text3: 'NA',
            text4: 'NA',
            pageNo: filters.pageNo || 1,
            sortField: 11,
            pageSize: filters.pageSize || 10,
        };
        return this.http.post<any>(
            `${this.API_BASE_URL}/api/opening_stock_serialnos/opening_stock_serialnos_PageList`,
            body,
        );
    }

    getById(srno: number): Observable<any> {
        return this.http.get<any>(`${this.API_BASE_URL}/api/opening_stock_serialnos/getbyid/${srno}`);
    }

    save(data: any): Observable<any> {
        if (!data?.os_srno) {
            throw new Error('Opening stock parent srno is required');
        }
        const body = this.makeSaveBody(data);
        return this.http.post<any>(`${this.API_BASE_URL}/api/opening_stock_serialnos/save`, body);
    }

    makeSaveBody(data: any): any {
        const body = this.removeRetFields(data);
        const today = this.today();
        this.setImageExtension(body, 'serial_img');
        return {
            ...body,
            srno: body.srno || 0,
            os_srno: body.os_srno,
            status: body.status ?? 0,
            qty: body.qty ?? 1,
            created_user_id: 0,
            updated_user_id: 0,
            bm_srno: 0,
            disID: 0,
            created_dt: today,
            updated_dt: today,
        };
    }

    removeRetFields(data: any): any {
        const body: any = {};
        for (const key of Object.keys(data || {})) {
            if (!key.startsWith('ret_')) {
                body[key] = data[key];
            }
        }
        return body;
    }

    setImageExtension(body: any, field: string): void {
        if (!body[field]) {
            return;
        }
        const value = String(body[field]).trim();
        const dotIndex = value.lastIndexOf('.');
        body[field] = dotIndex >= 0 ? value.slice(dotIndex).toLowerCase() : value;
    }

    today(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
    }
}
