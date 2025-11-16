import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {

  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;


    return this.http.get<T>(fullUrl, { params: httpParams });
  }

  getBlob(endpoint: string, params?: any): Observable<Blob> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;

    return this.http.get(fullUrl, { 
      params: httpParams,
      responseType: 'blob'
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;

    
    return this.http.post<T>(fullUrl, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;

    
    return this.http.put<T>(fullUrl, data);
  }

  patch<T>(endpoint: string, data?: any): Observable<T> {
    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;

    
    return this.http.patch<T>(fullUrl, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    const fullUrl = `${API_CONFIG.baseUrl}${endpoint}`;

    
    return this.http.delete<T>(fullUrl);
  }
}