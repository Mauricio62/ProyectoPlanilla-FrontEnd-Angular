export interface AsistenciaTrabajadorDTO {
  idAsistencia: number;
  idTrabajador: number;
  documento: string;
  nombre: string;
  año: number; 
   mes: number;       
  diasLaborales: number;
  diasDescanso: number;
  diasInasistencia: number;
  diasFeriados: number;
  horasExtra25: number; 
  horasExtra35: number;
  fecCreacion: Date;   
  activo: boolean;
}

export interface AsistenciaTrabajadorResponse {
  idTrabajador: number;
  documento: string;
  nombre: string;
  diasLaborales: number;
  diasDescanso: number;
  diasInasistencia: number;
  diasFeriados: number;
  horasExtra25: number;
  horasExtra35: number;
  idAsistencia: number;
}

export interface AsistenciaFilter {
  anio?: number;
  mes?: number;
}
