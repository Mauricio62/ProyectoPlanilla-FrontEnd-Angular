import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { 
  TipoDocumentoDTO, 
  PageResponse, 
  EstadoEnum,
  ApiResponse 
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class TipoDocumentoService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene la lista paginada de tipos de documento
   */
  getTiposDocumento(
    estado: EstadoEnum = EstadoEnum.TODOS,
    texto: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<TipoDocumentoDTO>> {
    const params = new URLSearchParams();
    params.append('estado', estado);
    params.append('texto', texto);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    return this.apiService.get<PageResponse<TipoDocumentoDTO>>(
      `${API_CONFIG.endpoints.tipoDocumento.list}?${params.toString()}`
    );
  }

  /**
   * Obtiene un tipo de documento por ID
   */
  getTipoDocumentoById(id: number): Observable<TipoDocumentoDTO> {
    return this.apiService.get<TipoDocumentoDTO>(
      `${API_CONFIG.endpoints.tipoDocumento.getById}/${id}`
    );
  }

  /**
   * Crea un nuevo tipo de documento
   */
  createTipoDocumento(tipoDocumento: TipoDocumentoDTO): Observable<TipoDocumentoDTO> {
    return this.apiService.post<TipoDocumentoDTO>(
      API_CONFIG.endpoints.tipoDocumento.create,
      tipoDocumento
    );
  }

  /**
   * Actualiza un tipo de documento existente
   */
  updateTipoDocumento(id: number, tipoDocumento: TipoDocumentoDTO): Observable<TipoDocumentoDTO> {
    return this.apiService.put<TipoDocumentoDTO>(
      `${API_CONFIG.endpoints.tipoDocumento.update}/${id}`,
      tipoDocumento
    );
  }

  /**
   * Cambia el estado de un tipo de documento
   */
  changeStatus(id: number): Observable<number> {
    return this.apiService.patch<number>(
      `${API_CONFIG.endpoints.tipoDocumento.changeStatus}/${id}`
    );
  }
}
