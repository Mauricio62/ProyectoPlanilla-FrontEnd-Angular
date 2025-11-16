import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CargoDTO, EstadoEnum, PageResponse } from '../../shared/models';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  constructor(private apiService: ApiService) {
   
  }

  listar(estado: EstadoEnum = EstadoEnum.TODOS,searchTerm: string = '', page: number = 0, size: number = 10): Observable<PageResponse<CargoDTO>> {
    const params = {
      estado: estado,
      Texto: searchTerm,
      page: page,
      size: size
    };
    console.log('Parametros enviados al servicio listar:', params);

    return this.apiService.get<PageResponse<CargoDTO>>(API_CONFIG.endpoints.cargo.list, params);
  }

  obtenerPorId(id: number): Observable<CargoDTO> {
   
    return this.apiService.get<CargoDTO>(`${API_CONFIG.endpoints.cargo.getById}/${id}`);
  }

  crear(cargo: CargoDTO): Observable<CargoDTO> {
  
    return this.apiService.post<CargoDTO>(API_CONFIG.endpoints.cargo.create, cargo);
  }

  actualizar(id: number, cargo: CargoDTO): Observable<CargoDTO> {
  
    return this.apiService.put<CargoDTO>(`${API_CONFIG.endpoints.cargo.update}/${id}`, cargo);
  }

  cambiarEstado(id: number): Observable<number> {

    return this.apiService.patch<number>(`${API_CONFIG.endpoints.cargo.changeStatus}/${id}`);
  }

  eliminar(id: number): Observable<void> {
    return this.apiService.delete<void>(`${API_CONFIG.endpoints.cargo.delete}/${id}`);
  }
}