import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User, RoleDTO } from '../../shared/models';
import { StorageService } from './storage.service';
import { API_CONFIG } from '../config/api.config';
import { CONSTANTS } from '../config/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    // Solo verificar autenticación en el navegador
    if (isPlatformBrowser(this.platformId)) {

      this.checkAuthenticationStatus();
    } else {
 
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`, credentials)
      .pipe(
        tap(response => {
        
          if (response.token) {
         
            this.storageService.setItem(CONSTANTS.STORAGE_KEYS.TOKEN, response.token);
            
            const user: User = {
              username: response.username || credentials.username,
              email: '',
              roles: response.roles || []
            };
            
       
            this.storageService.setItem(CONSTANTS.STORAGE_KEYS.USER, user);
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    console.log(userData);
    return this.http.post<RegisterResponse>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`, userData);
  }

  getRoles(): Observable<RoleDTO[]> {
   
    return this.http.get<RoleDTO[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.roles}`);
  }

  logout(): void {

    this.storageService.removeItem(CONSTANTS.STORAGE_KEYS.TOKEN);
    this.storageService.removeItem(CONSTANTS.STORAGE_KEYS.USER);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    const token = this.storageService.getItem<string>(CONSTANTS.STORAGE_KEYS.TOKEN);

    return token;
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;

    return user;
  }

  isAuthenticated(): boolean {
    const isAuth = this.isAuthenticatedSubject.value;
   
    return isAuth;
  }

  private checkAuthenticationStatus(): void {

    const token = this.getToken();
    const user = this.storageService.getItem<User>(CONSTANTS.STORAGE_KEYS.USER);
    
    if (token && user) {
  
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    } else {
    
    }
  }
}