export interface SistemaPensionDTO {
  idSistemaPension?: number;
  nombre: string;
  aporte?: number;
    comision?: number;
      prima?: number;
  fecCreacion?: Date;
  fecUltimaModificacion?: Date;
  activo: boolean;
}
