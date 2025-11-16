import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TrabajadorDTO, PageResponse, EstadoEnum } from '../../shared/models';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  constructor(private apiService: ApiService) { }

  listar(estado: EstadoEnum = EstadoEnum.TODOS, searchTerm: string = '', page: number = 0, size: number = 10): Observable<PageResponse<TrabajadorDTO>> {
    const params = {
      estado: estado,
      Texto: searchTerm,
      page: page,
      size: size
    };
    console.log('Parametros enviados al servicio listar trabajadores:', params);

    return this.apiService.get<PageResponse<TrabajadorDTO>>(API_CONFIG.endpoints.trabajador.list, params);
  }

  obtenerPorId(id: number): Observable<TrabajadorDTO> {
    return this.apiService.get<TrabajadorDTO>(`${API_CONFIG.endpoints.trabajador.getById}/${id}`);
  }

  crear(trabajador: TrabajadorDTO): Observable<TrabajadorDTO> {
    return this.apiService.post<TrabajadorDTO>(API_CONFIG.endpoints.trabajador.create, trabajador);
  }

  actualizar(id: number, trabajador: TrabajadorDTO): Observable<TrabajadorDTO> {
    return this.apiService.put<TrabajadorDTO>(`${API_CONFIG.endpoints.trabajador.update}/${id}`, trabajador);
  }

  cambiarEstado(id: number): Observable<number> {
    return this.apiService.patch<number>(`${API_CONFIG.endpoints.trabajador.changeStatus}/${id}`);
  }

  eliminar(id: number): Observable<void> {
    return this.apiService.delete<void>(`${API_CONFIG.endpoints.trabajador.delete}/${id}`);
  }
}
