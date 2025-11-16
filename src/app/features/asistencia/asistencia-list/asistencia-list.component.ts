import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../../core/services/asistencia.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AsistenciaTrabajadorResponse, AsistenciaFilter, AsistenciaTrabajadorDTO } from '../../../shared/models';
import { Router } from '@angular/router';

// Extender la interfaz para soportar edición
interface AsistenciaEditable extends AsistenciaTrabajadorResponse {
  editing?: boolean;
  originalData?: any;
}

@Component({
  selector: 'app-asistencia-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-list.component.html',
  styleUrls: ['./asistencia-list.component.css']
})
export class AsistenciaListComponent implements OnInit {
  // Inyección de servicios
  private asistenciaService = inject(AsistenciaService);
   private router: Router = inject(Router);
  private notificationService = inject(NotificationService);

  // Signals para estado reactivo
  asistencias = signal<AsistenciaEditable[]>([]);
  loading = signal(false);
  error = signal(false);
  hasUnsavedChanges = signal(false);

  filtro: AsistenciaFilter = {
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1
  };

  ngOnInit(): void {
    this.buscarAsistencias();
  }


  buscarAsistencias(): void {
    if (this.filtro.anio && this.filtro.mes) {
      this.loading.set(true);
      this.hasUnsavedChanges.set(false);
      
      this.asistenciaService.buscarAsistencias(this.filtro.anio, this.filtro.mes).subscribe({
        next: (response) => {
          const asistenciasConEdicion = (response || []).map(asistencia => ({
            ...asistencia,
            editing: false,
            originalData: null
          }));
          this.asistencias.set(asistenciasConEdicion);
          this.notificationService.showSuccess('Búsqueda completada');
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error buscando asistencias:', error);
          this.notificationService.showError('Error al buscar asistencias');
          this.loading.set(false);
          this.error.set(true);
        }
      });
    }
  }

  habilitarEdicion(index: number): void {
    const asistenciasActuales = this.asistencias();
    const asistencia = asistenciasActuales[index];
    
    // Guardar datos originales
    asistencia.originalData = {
      diasLaborales: asistencia.diasLaborales,
      diasDescanso: asistencia.diasDescanso,
      diasInasistencia: asistencia.diasInasistencia,
      diasFeriados: asistencia.diasFeriados,
      horasExtra25: asistencia.horasExtra25,
      horasExtra35: asistencia.horasExtra35
    };
    
    asistencia.editing = true;
    
    this.asistencias.set([...asistenciasActuales]);
  }

  guardarFila(index: number): void {
    const asistenciasActuales = this.asistencias();
    const asistencia = asistenciasActuales[index];
    
    // Validar datos
    if (!this.validarDatos(asistencia)) {
      this.notificationService.showError('Por favor, ingresa valores válidos');
      return;
    }
    
    asistencia.editing = false;
    asistencia.originalData = null;
    
    this.asistencias.set([...asistenciasActuales]);
    this.hasUnsavedChanges.set(this.hayCambiosSinGuardar());
    this.notificationService.showSuccess('Cambios guardados localmente');
  }

  cancelarEdicion(index: number): void {
    const asistenciasActuales = this.asistencias();
    const asistencia = asistenciasActuales[index];
    
    // Restaurar datos originales
    if (asistencia.originalData) {
      Object.assign(asistencia, asistencia.originalData);
    }
    
    asistencia.editing = false;
    asistencia.originalData = null;
    
    this.asistencias.set([...asistenciasActuales]);
  }

  guardarCambios(): void {
    this.loading.set(true);
    
    const datosParaGuardar = this.asistencias().map(asistencia => ({
      idTrabajador: asistencia.idTrabajador,
      idAsistencia: asistencia.idAsistencia,
      año : this.filtro.anio!,
      mes : this.filtro.mes!,
      diasLaborales: asistencia.diasLaborales,
      diasDescanso: asistencia.diasDescanso,
      diasInasistencia: asistencia.diasInasistencia,
      diasFeriados: asistencia.diasFeriados,
      horasExtra25: asistencia.horasExtra25,
      horasExtra35: asistencia.horasExtra35
    })) as  AsistenciaTrabajadorDTO[];
    
    this.asistenciaService.guardar(datosParaGuardar).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cambios guardados exitosamente');
        this.hasUnsavedChanges.set(false);
        this.loading.set(false);
        
        // Recargar datos para asegurar consistencia
        this.buscarAsistencias();
      },
      error: (error) => {
        console.error('Error guardando cambios:', error);
        this.notificationService.showError('Error al guardar los cambios');
        this.loading.set(false);
      }
    });
  }

  hayCambios(): boolean {
    return this.hasUnsavedChanges();
  }

  private hayCambiosSinGuardar(): boolean {
    console.log('Verificando cambios sin guardar...',this.asistencias().some(asistencia => asistencia.editing));
    console.log('Estado actual de asistencias:', this.asistencias());
    return this.asistencias().some(asistencia => asistencia.editing);
  }

  private validarDatos(asistencia: AsistenciaEditable): boolean {
    return (
      asistencia.diasLaborales >= 0 &&
      asistencia.diasDescanso >= 0 &&
      asistencia.diasInasistencia >= 0 &&
      asistencia.diasFeriados >= 0 &&
      asistencia.horasExtra25 >= 0 &&
      asistencia.horasExtra35 >= 0
    );
  }

  descargarExcel(): void {
    if (this.filtro.anio && this.filtro.mes) {
      this.loading.set(true);
      
      this.asistenciaService.descargarExcel(this.filtro.anio, this.filtro.mes).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `asistencias_${this.filtro.anio}_${this.filtro.mes}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.notificationService.showSuccess('Archivo descargado exitosamente');
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error descargando Excel:', error);
          this.notificationService.showError('Error al descargar el archivo');
          this.loading.set(false);
          this.error.set(true);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.filtro.anio && this.filtro.mes) {
      this.loading.set(true);
      this.hasUnsavedChanges.set(false);
      
      this.asistenciaService.cargarExcel(file, this.filtro.anio, this.filtro.mes).subscribe({
        next: (response) => {
          console.log('Respuesta de carga:', response);
          const asistenciasConEdicion = (response.data || []).map(asistencia => ({
            ...asistencia,
            editing: false,
            originalData: null
          }));
          this.asistencias.set(asistenciasConEdicion);
          this.notificationService.showSuccess('Archivo cargado exitosamente');
          this.loading.set(false);
          
          // Limpiar input file
          event.target.value = '';
        },
        error: (error) => {
          console.error('Error cargando Excel:', error);
          this.notificationService.showError('Error al cargar el archivo');
          this.loading.set(false);
          this.error.set(true);
          event.target.value = '';
        }
      });
    }
  }

  onRetry(): void {
    this.error.set(false);
    this.buscarAsistencias();
  }
    onCancel(): void {
    this.router.navigate(['/main-menu']);
  }
}