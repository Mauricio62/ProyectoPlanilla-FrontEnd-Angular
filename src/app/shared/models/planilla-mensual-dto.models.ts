import { PlanillaMensualResponse } from "./planilla-mensual-response.models";

export interface PlanillaMensualDTO extends PlanillaMensualResponse {
 activo: boolean;
  fecCreacion: string;
  fecUltimaModificacion: string;
}