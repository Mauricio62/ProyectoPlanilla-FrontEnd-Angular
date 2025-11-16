import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import {   GeneroDTO,   PageResponse,   EstadoEnum,  ApiResponse} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class GeneroService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene la lista paginada de géneros
   */
  getGeneros(
    estado: EstadoEnum = EstadoEnum.TODOS,
    texto: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<GeneroDTO>> {
    const params = {
      estado: estado,
      texto: texto,
      page: page,
      size: size
    };
    console.log('Parametros enviados al servicio listar:', params);
    return this.apiService.get<PageResponse<GeneroDTO>>(API_CONFIG.endpoints.genero.list, { params });
  }

  /**
   * Obtiene un género por ID
   */
  getGeneroById(id: number): Observable<GeneroDTO> {
    return this.apiService.get<GeneroDTO>(
      `${API_CONFIG.endpoints.genero.getById}/${id}`
    );
  }

  /**
   * Crea un nuevo género
   */
  createGenero(genero: GeneroDTO): Observable<GeneroDTO> {
    return this.apiService.post<GeneroDTO>(
      API_CONFIG.endpoints.genero.create,
      genero
    );
  }

  /**
   * Actualiza un género existente
   */
  updateGenero(id: number, genero: GeneroDTO): Observable<GeneroDTO> {
    return this.apiService.put<GeneroDTO>(
      `${API_CONFIG.endpoints.genero.update}/${id}`,
      genero
    );
  }

  /**
   * Cambia el estado de un género
   */
  changeStatus(id: number): Observable<number> {
    return this.apiService.patch<number>(
      `${API_CONFIG.endpoints.genero.changeStatus}/${id}`
    );
  }

  /**
   * Elimina un género
   */
  deleteGenero(id: number): Observable<number> {
    return this.apiService.delete<number>(
      `${API_CONFIG.endpoints.genero.changeStatus}/${id}`
    );
  }
}
