import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Crear un servicio de loading global
const loadingSubject = new BehaviorSubject<boolean>(false);
export const loading$ = loadingSubject.asObservable();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  let activeRequests = 0;
  
  activeRequests++;
  loadingSubject.next(true);

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        loadingSubject.next(false);
      }
    })
  );
};