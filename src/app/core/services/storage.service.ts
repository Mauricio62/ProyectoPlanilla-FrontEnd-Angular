import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isLocalStorageAvailable(): boolean {
    const available = isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
    return available;
  }

  setItem(key: string, value: any): void {
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
       } catch (error) {
        console.warn('⚠️ Error guardando en localStorage:', error);
      }
    } else {
     
    }
  }

  getItem<T>(key: string): T | null {
   
    if (this.isLocalStorageAvailable()) {
      try {
        const item = localStorage.getItem(key);
        const parsed = item ? JSON.parse(item) : null;
      
        return parsed;
      } catch (error) {
        console.warn('⚠️ Error leyendo de localStorage:', error);
        return null;
      }
    } else {
     
      return null;
    }
  }

  removeItem(key: string): void {
    
    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(key);
      
      } catch (error) {
        console.warn('⚠️ Error removiendo de localStorage:', error);
      }
    } else {
      console.log('⚠️ localStorage no disponible, omitiendo remoción');
    }
  }

  clear(): void {

    if (this.isLocalStorageAvailable()) {
      try {
        localStorage.clear();
        console.log('✅ Storage limpiado exitosamente');
      } catch (error) {
        console.warn('⚠️ Error limpiando localStorage:', error);
      }
    } else {
      console.log('⚠️ localStorage no disponible, omitiendo limpieza');
    }
  }
}