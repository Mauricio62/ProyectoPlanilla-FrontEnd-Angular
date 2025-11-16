export interface CargoDTO {
  idCargo?: number;
  nombre: string;
  fecCreacion?: Date;
  fecUltimaModificacion?: Date;
  activo: boolean;
}

export enum EstadoEnum {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  TODOS = 'TODOS'
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}