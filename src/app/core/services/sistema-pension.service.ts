import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { 
  SistemaPensionDTO, 
  PageResponse, 
  EstadoEnum,
  ApiResponse 
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class SistemaPensionService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene la lista paginada de sistemas de pensión
   */
  getSistemasPension(
    estado: EstadoEnum = EstadoEnum.TODOS,
    texto: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<SistemaPensionDTO>> {
    const params = {
      estado: estado,
      texto: texto,
      page: page,
      size: size
    };
    
    return this.apiService.get<PageResponse<SistemaPensionDTO>>(     API_CONFIG.endpoints.sistemaPension.list,params    );
  }

  /**
   * Obtiene un sistema de pensión por ID
   */
  getSistemaPensionById(id: number): Observable<SistemaPensionDTO> {
    return this.apiService.get<SistemaPensionDTO>(
      `${API_CONFIG.endpoints.sistemaPension.getById}/${id}`
    );
  }

  /**
   * Crea un nuevo sistema de pensión
   */
  createSistemaPension(sistemaPension: SistemaPensionDTO): Observable<SistemaPensionDTO> {
    return this.apiService.post<SistemaPensionDTO>(
      API_CONFIG.endpoints.sistemaPension.create,
      sistemaPension
    );
  }

  /**
   * Actualiza un sistema de pensión existente
   */
  updateSistemaPension(id: number, sistemaPension: SistemaPensionDTO): Observable<SistemaPensionDTO> {
    return this.apiService.put<SistemaPensionDTO>(
      `${API_CONFIG.endpoints.sistemaPension.update}/${id}`,
      sistemaPension
    );
  }

  /**
   * Cambia el estado de un sistema de pensión
   */
  changeStatus(id: number): Observable<number> {
    return this.apiService.patch<number>(
      `${API_CONFIG.endpoints.sistemaPension.changeStatus}/${id}`
    );
  }

  /**
   * Elimina un sistema de pensión
   */
  deleteSistemaPension(id: number): Observable<number> {
    return this.apiService.delete<number>(
      `${API_CONFIG.endpoints.sistemaPension.changeStatus}/${id}`
    );
  }
}
