import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('AuthInterceptor - URL:', req.url);
  console.log('AuthInterceptor - Token:', token ? 'Presente' : 'No presente');

  if (token) {
    console.log('AuthInterceptor - Agregando token a la petición');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(authReq);
  } else {
    console.log('AuthInterceptor - No hay token, continuando sin autorización');
  }
  
  return next(req);
};