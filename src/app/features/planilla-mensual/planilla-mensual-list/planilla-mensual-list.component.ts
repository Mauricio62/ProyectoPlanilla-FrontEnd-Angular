import { CommonModule } from "@angular/common";
import { Component, effect, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PlanillaMensualService } from "../../../core/services/planilla-mensual.service";
import { PlanillaMensualResponse } from "../../../shared/models/planilla-mensual-response.models";
import { PlanillaMensualDTO } from "../../../shared/models/planilla-mensual-dto.models";
import { BoletaModalComponent } from "../../boleta-modal/boleta-modal.component";
import { finalize } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: 'app-planilla-mensual',
  standalone: true,
  imports: [CommonModule, FormsModule, BoletaModalComponent],
  templateUrl: './planilla-mensual-list.component.html',
  styleUrls: ['./planilla-mensual-list.component.css']
})

export class PlanillaMensualComponent {
  private planillaService = inject(PlanillaMensualService);
   private router: Router = inject(Router);
  // Signals para estado reactivo - ahora usando PlanillaBase para ambos
  anio = signal<number>(new Date().getFullYear());
  mes = signal<number>(new Date().getMonth() + 1);
  planillas = signal<PlanillaMensualResponse[]>([]);
  planillasCalculadas = signal<PlanillaMensualResponse[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  showBoletaModal = signal<boolean>(false);
  selectedDocumento = signal<string>('');
  selectedTrabajador = signal<any>(null);

  // Listas para selects
  meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  anios = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  constructor() {
    // Efecto para cargar automáticamente al cambiar año o mes
    effect(() => {
      const anio = this.anio();
      const mes = this.mes();
      // Opcional: cargar automáticamente al inicializar
      // this.listarPlanillas();
    });
  }

  // Métodos usando subscribe y pipe
  listarPlanillas() {
    this.isLoading.set(true);
    this.error.set(null);

    this.planillaService.listarPlanillaMensual(this.anio(), this.mes())
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (result) => {
          this.planillas.set(result);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar las planillas. Intente nuevamente.');
          console.error(err);
        }
      });
  }

  calcularPlanillas() {
    this.isLoading.set(true);
    this.error.set(null);

    this.planillaService.calcularPlanillas(this.anio(), this.mes())
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (result) => {
          this.planillasCalculadas.set(result);
          // Mostrar las planillas calculadas en la tabla
          this.planillas.set(result);
          console.log('Planillas calculadas:', result);
          console.log('Planillas señal:', this.planillas());
          console.log('Planillas calculadas señal:', this.planillasCalculadas());
        },
        error: (err) => {
          this.error.set(err.message || 'Error al calcular las planillas. Intente nuevamente.');
          console.error(err);
        }
      });
  }

  guardarPlanillas() {
    if (this.planillasCalculadas().length === 0) {
      this.error.set('No hay planillas calculadas para guardar.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.planillaService.guardarPlanillas(this.planillasCalculadas() as PlanillaMensualResponse[])
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          alert('Planillas guardadas correctamente');
          this.listarPlanillas(); // Recargar la lista
        },
        error: (err) => {
          this.error.set(err.message || 'Error al guardar las planillas. Intente nuevamente.');
          console.error(err);
        }
      });
  }

  verBoleta(planilla: PlanillaMensualResponse) {
    this.selectedDocumento.set(planilla.trabajador?.documento || '');
    this.selectedTrabajador.set(planilla.trabajador);
    this.showBoletaModal.set(true);
  }

  onModalClose() {
    this.showBoletaModal.set(false);
    this.selectedDocumento.set('');
    this.selectedTrabajador.set(null);
  }

  // Reintentar en caso de error
  retry() {
    this.error.set(null);
    this.listarPlanillas();
  }

  // Método para obtener el texto a mostrar en la tabla
  getDisplayValue(planilla: PlanillaMensualResponse, field: keyof PlanillaMensualResponse): any {
    // Para campos numéricos, usar el formato adecuado
    if (typeof planilla[field] === 'number') {
      return planilla[field];
    }
    return planilla[field] || 'N/A';
  }
      onCancel(): void {
    this.router.navigate(['/main-menu']);
  }
}