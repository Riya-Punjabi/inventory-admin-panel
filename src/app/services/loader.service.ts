import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class LoaderService {
    loading$ = new BehaviorSubject(false);

    show(): void {
        this.loading$.next(true);
    }

    hide(): void {
        this.loading$.next(false);
    }
}