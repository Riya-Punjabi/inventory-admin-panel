import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class LoaderService {
    private readonly loadingSubject = new BehaviorSubject(false);
    private activeRequests = 0;
    private emitQueued = false;

    readonly loading$ = this.loadingSubject.asObservable();

    show(): void {
        this.activeRequests++;
        this.queueLoadingEmit();
    }

    hide(): void {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.queueLoadingEmit();
    }

    private queueLoadingEmit(): void {
        if (this.emitQueued) {
            return;
        }

        this.emitQueued = true;

        queueMicrotask(() => {
            this.emitQueued = false;
            this.loadingSubject.next(this.activeRequests > 0);
        });
    }
}
