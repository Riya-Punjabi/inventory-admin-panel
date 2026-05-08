import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ApiService {

    baseUrl = 'https://api2023.zerolite.in';

    constructor(private http: HttpClient) { }
    

    login(data: any) {
        return this.http.post(`${this.baseUrl}/api/login`, data);
    }

}