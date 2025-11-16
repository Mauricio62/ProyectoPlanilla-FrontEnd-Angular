export interface TrabajadorDTO {
  idTrabajador?: number;
  idTipoDocumento?: number;
  documento?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  idGenero?: number;
  idEstadoCivil?: number;
  direccion?: string;
  email?: string;
  hijos?: number;
  idCargo?: number;
  fecNacimiento?: Date;
  fecIngreso?: Date;
  idSituacion?: number;
  idSistemaPension?: number;
  foto?: string;
  activo?: boolean;
  fecCreacion?: Date;
  fecUltimaModificacion?: Date;
}

export interface TrabajadorResponse {
  idTrabajador: number;
  documento: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccion: string;
  email: string;
  hijos: number;
  fecNacimiento: Date;
  fecIngreso: Date;
  activo: boolean;
  fecCreacion: Date;
  // Campos relacionados
  tipoDocumento?: string;
  genero?: string;
  estadoCivil?: string;
  cargo?: string;
  situacion?: string;
  sistemaPension?: string;
}
