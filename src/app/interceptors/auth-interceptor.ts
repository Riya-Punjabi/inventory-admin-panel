import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('authToken');
  const loader = inject(LoaderService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  loader.show();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.clear();
        messageService.add({
          severity: 'error',
          summary: 'Unauthorized',
          detail: 'Session expired. Please login again.',
          life: 3000
        });

        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),

    finalize(() => {
      loader.hide();
    })
  );
};