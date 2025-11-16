import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { 
  EstadoCivilDTO, 
  PageResponse, 
  EstadoEnum,
  ApiResponse 
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class EstadoCivilService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene la lista paginada de estados civiles
   */
  getEstadosCiviles(
    estado: EstadoEnum = EstadoEnum.TODOS,
    texto: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<EstadoCivilDTO>> {
    const params = new URLSearchParams();
    params.append('estado', estado);
    params.append('texto', texto);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    return this.apiService.get<PageResponse<EstadoCivilDTO>>(
      `${API_CONFIG.endpoints.estadoCivil.list}?${params.toString()}`
    );
  }

  /**
   * Obtiene un estado civil por ID
   */
  getEstadoCivilById(id: number): Observable<EstadoCivilDTO> {
    return this.apiService.get<EstadoCivilDTO>(
      `${API_CONFIG.endpoints.estadoCivil.getById}/${id}`
    );
  }

  /**
   * Crea un nuevo estado civil
   */
  createEstadoCivil(estadoCivil: EstadoCivilDTO): Observable<EstadoCivilDTO> {
    return this.apiService.post<EstadoCivilDTO>(
      API_CONFIG.endpoints.estadoCivil.create,
      estadoCivil
    );
  }

  /**
   * Actualiza un estado civil existente
   */
  updateEstadoCivil(id: number, estadoCivil: EstadoCivilDTO): Observable<EstadoCivilDTO> {
    return this.apiService.put<EstadoCivilDTO>(
      `${API_CONFIG.endpoints.estadoCivil.update}/${id}`,
      estadoCivil
    );
  }

  /**
   * Cambia el estado de un estado civil
   */
  changeStatus(id: number): Observable<number> {
    return this.apiService.patch<number>(
      `${API_CONFIG.endpoints.estadoCivil.changeStatus}/${id}`
    );
  }

  /**
   * Elimina un estado civil
   */
  deleteEstadoCivil(id: number): Observable<number> {
    return this.apiService.delete<number>(
      `${API_CONFIG.endpoints.estadoCivil.changeStatus}/${id}`
    );
  }
}
