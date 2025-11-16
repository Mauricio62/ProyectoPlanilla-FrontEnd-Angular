import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { forkJoin, Observable } from "rxjs";
import { API_CONFIG } from '../config/api.config';
import { PlanillaMensualDTO } from "../../shared/models/planilla-mensual-dto.models";
import { PlanillaPorDocumentoDTO } from "../../shared/models/planilla-por-documento-dto";
import { PlanillaMensualResponse } from "../../shared/models/planilla-mensual-response.models";
import { TrabajadorService } from "./trabajador.service";

@Injectable({
    providedIn: 'root'
})
export class PlanillaMensualService {
    constructor(private apiService: ApiService) { }
    listarPlanillaMensual(anio: number, mes: number): Observable<PlanillaMensualDTO[]> {
        const params = {
            anio: anio,
            mes: mes
        };

        return this.apiService.get<PlanillaMensualDTO[]>(API_CONFIG.endpoints.planillaMensual.listar, params);
    }

    obtenerPlanillaPorDocumento(anio: number, mes: number, documento: string): Observable<PlanillaPorDocumentoDTO> {
        const params = {
            año: anio,
            mes: mes,
            documento: documento
        };
        console.log(params);

        return this.apiService.get<PlanillaPorDocumentoDTO>(API_CONFIG.endpoints.planillaMensual.buscarBoleta, params);
    }

    calcularPlanillas(anio: number, mes: number): Observable<PlanillaMensualResponse[]> {
        const params = {
            año: anio,
            mes: mes
        };

        return this.apiService.get<PlanillaMensualResponse[]>(API_CONFIG.endpoints.planillaMensual.calcularPlanilla, params);
    }

    guardarPlanillas(planillas: PlanillaMensualResponse[]): Observable<string> {
        return this.apiService.post<string>(API_CONFIG.endpoints.planillaMensual.guardarPlanilla, planillas);


    }

}
