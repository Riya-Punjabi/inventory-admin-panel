import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from './services/loader.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ProgressSpinnerModule, AsyncPipe, ConfirmDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('adminPanel');

  loaderService =
    inject(LoaderService);
}
