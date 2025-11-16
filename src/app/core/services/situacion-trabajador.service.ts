import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { 
  SituacionTrabajadorDTO, 
  PageResponse, 
  EstadoEnum,
  ApiResponse 
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class SituacionTrabajadorService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene la lista paginada de situaciones de trabajador
   */
  getSituaciones(
    estado: EstadoEnum = EstadoEnum.TODOS,
    texto: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<SituacionTrabajadorDTO>> {
    const params = new URLSearchParams();
    params.append('estado', estado);
    params.append('texto', texto);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    return this.apiService.get<PageResponse<SituacionTrabajadorDTO>>(
      `${API_CONFIG.endpoints.situacionTrabajador.list}?${params.toString()}`
    );
  }

  /**
   * Obtiene una situación de trabajador por ID
   */
  getSituacionById(id: number): Observable<SituacionTrabajadorDTO> {
    return this.apiService.get<SituacionTrabajadorDTO>(
      `${API_CONFIG.endpoints.situacionTrabajador.getById}/${id}`
    );
  }

  /**
   * Crea una nueva situación de trabajador
   */
  createSituacion(situacion: SituacionTrabajadorDTO): Observable<SituacionTrabajadorDTO> {
    return this.apiService.post<SituacionTrabajadorDTO>(
      API_CONFIG.endpoints.situacionTrabajador.create,
      situacion
    );
  }

  /**
   * Actualiza una situación de trabajador existente
   */
  updateSituacion(id: number, situacion: SituacionTrabajadorDTO): Observable<SituacionTrabajadorDTO> {
    return this.apiService.put<SituacionTrabajadorDTO>(
      `${API_CONFIG.endpoints.situacionTrabajador.update}/${id}`,
      situacion
    );
  }

  /**
   * Cambia el estado de una situación de trabajador
   */
  changeStatus(id: number): Observable<number> {
    return this.apiService.patch<number>(`${API_CONFIG.endpoints.situacionTrabajador.changeStatus}/${id}`);
  }
}
