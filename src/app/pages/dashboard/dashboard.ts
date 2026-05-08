import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { OpeningStockService } from '../../services/opening-stock.service';
import { SerialNoService } from '../../services/serial-no.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [TableModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  constructor(private openingStockService: OpeningStockService, private serialNoService: SerialNoService, private cdr: ChangeDetectorRef) { }

  openingStockCount = 0;
  serialCount = 0;
  recentStocks: any[] = [];

  ngOnInit(): void {
    this.loadOpeningStocks();
    this.loadSerialNumbers();
  }

  loadOpeningStocks(): void {
    this.openingStockService.list({ pageNo: 1, pageSize: 5 }).subscribe({
      next: (response) => {
        this.recentStocks =
          response.data || [];
        this.openingStockCount =
          response.totalRecords || 0;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  loadSerialNumbers(): void {
    this.serialNoService.list({ parentSrno: 0, pageNo: 1, pageSize: 10 })
      .subscribe({
        next: (response) => {
          this.serialCount =
            response.totalRecords || 0;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
        }
      });
  }
}
