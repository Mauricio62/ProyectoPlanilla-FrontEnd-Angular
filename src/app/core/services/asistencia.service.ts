import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_CONFIG } from '../config/api.config';
import { 
  AsistenciaTrabajadorDTO, 
  AsistenciaTrabajadorResponse, 
  AsistenciaFilter,
  ApiResponse 
} from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene la lista de asistencias por período
   */
  getAsistencias(filtro: AsistenciaFilter = {}): Observable<AsistenciaTrabajadorResponse[]> {
    const params = new URLSearchParams();
    if (filtro.anio) params.append('año', filtro.anio.toString());
    if (filtro.mes) params.append('mes', filtro.mes.toString());
    
    return this.apiService.get<AsistenciaTrabajadorResponse[]>(
      `${API_CONFIG.endpoints.asistencia.list}?${params.toString()}`
    );
  }

  /**
   * Busca asistencias por período específico
   */
  buscarAsistencias(año: number, mes: number): Observable<AsistenciaTrabajadorResponse[]> {
    const params = new URLSearchParams();
    params.append('año', año.toString());
    params.append('mes', mes.toString());
    
    return this.apiService.get<AsistenciaTrabajadorResponse[]>(
      `${API_CONFIG.endpoints.asistencia.buscar}?${params.toString()}`
    );
  }

  /**
   * Descarga el archivo Excel de asistencias
   */
  descargarExcel(año: number, mes: number): Observable<Blob> {
    const params = new URLSearchParams();
    params.append('año', año.toString());
    params.append('mes', mes.toString());
    
    return this.apiService.getBlob(
      `${API_CONFIG.endpoints.asistencia.descargarExcel}?${params.toString()}`
    );
  }

  /**
   * Carga un archivo Excel de asistencias
   */
  cargarExcel(archivo: File, año: number, mes: number): Observable<ApiResponse< AsistenciaTrabajadorResponse[]>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('año', año.toString());
    formData.append('mes', mes.toString());
    
    return this.apiService.post<ApiResponse< AsistenciaTrabajadorResponse[]>>(
      API_CONFIG.endpoints.asistencia.cargarExcel,
      formData
    );
  }
  guardar(datos:AsistenciaTrabajadorDTO[]): Observable<boolean> {
    return this.apiService.post<boolean>(
     API_CONFIG.endpoints.asistencia.guardar, datos
    );
  }


}
