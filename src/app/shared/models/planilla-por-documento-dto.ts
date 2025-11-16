import { PlanillaMensualResponse } from "./planilla-mensual-response.models";

export interface PlanillaPorDocumentoDTO extends PlanillaMensualResponse {
// Campos específicos para búsqueda por documento
  vhorasExtra1: number;
  vhorasExtra2: number;
  vasigFamiliar: number;
  vferiadoTrab: number;
  totalNetoBoletaCad: string;
  ndiasTrab: number;
  nhorasNormal: number;
}