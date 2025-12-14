import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // URLs que NO requieren token (endpoints públicos de autenticación)
  // Verificar tanto la ruta relativa como la URL completa
  const publicUrls = ['/auth/login', '/auth/register', '/auth/roles'];
  const url = req.url.toLowerCase();
  const isPublicUrl = publicUrls.some(publicUrl => 
    url.includes(publicUrl.toLowerCase()) || 
    url.endsWith(publicUrl.toLowerCase())
  );

  console.log('AuthInterceptor - URL:', req.url);
  console.log('AuthInterceptor - Es URL pública:', isPublicUrl);
  console.log('AuthInterceptor - Token:', token ? 'Presente' : 'No presente');

  // Si es una URL pública, NO agregar el token (incluso si existe uno)
  if (isPublicUrl) {
    console.log('AuthInterceptor - URL pública detectada, continuando sin token');
    return next(req);
  }

  // Para URLs protegidas, agregar el token si existe
  if (token) {
    console.log('AuthInterceptor - Agregando token a la petición protegida');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(authReq);
  } else {
    console.log('AuthInterceptor - No hay token para URL protegida');
  }
  
  return next(req);
};