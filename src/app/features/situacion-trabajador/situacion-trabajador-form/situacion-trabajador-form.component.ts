import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SituacionTrabajadorService } from '../../../core/services/situacion-trabajador.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SituacionTrabajadorDTO } from '../../../shared/models';

@Component({
  selector: 'app-situacion-trabajador-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './situacion-trabajador-form.component.html',
  styleUrls: ['./situacion-trabajador-form.component.css']
})
export class SituacionTrabajadorFormComponent implements OnInit {
  situacionForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  situacionId: number | null = null;
  situacion: SituacionTrabajadorDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private situacionTrabajadorService: SituacionTrabajadorService,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.url.subscribe(segments => {
      const path = segments.map(s => s.path).join('/');
      
      if (path === 'create') {
        this.setupCreateMode();
      } else if (path.startsWith('edit/')) {
        const id = +path.split('/')[1];
        this.setupEditMode(id);
      } else if (path.startsWith('view/')) {
        const id = +path.split('/')[1];
        this.setupViewMode(id);
      }
    });
  }

  private initForm(): void {
    this.situacionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      activo: [true]
    });
  }
toggleEstado(): void {
    if (this.situacion?.idSituacion) {
      this.situacionTrabajadorService.changeStatus(this.situacion.idSituacion).subscribe({
        next: () => {
          this.notificationService.show('Estado cambiado exitosamente', 'success');
          this.router.navigate(['/situacion-trabajador']);
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.notificationService.show('Error al cambiar el estado', 'error');
        }
      });
    }
  }
  private setupCreateMode(): void {
    this.isEditing = false;
    this.isViewing = false;
    this.situacionId = null;
    this.situacion = null;
    this.situacionForm.reset({ activo: true });
    this.situacionForm.enable();
  }

  private setupEditMode(id: number): void {
    this.isEditing = true;
    this.isViewing = false;
    this.situacionId = id;
    this.loadSituacion(id);
    this.situacionForm.enable();
  }

  private setupViewMode(id: number): void {
    this.isEditing = false;
    this.isViewing = true;
    this.situacionId = id;
    this.loadSituacion(id);
    this.situacionForm.disable();
  }

  private loadSituacion(id: number): void {
    this.situacionTrabajadorService.getSituacionById(id).subscribe({
      next: (situacion) => {
        this.situacion = situacion;
        this.situacionForm.patchValue({
          nombre: situacion.nombre,
           activo: situacion.activo
        });
      },
      error: (error) => {
        console.error('Error cargando situación:', error);
        this.notificationService.show('Error al cargar la situación', 'error');
        this.router.navigate(['/situacion-trabajador']);
      }
    });
  }

  onSubmit(): void {
    if (this.situacionForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.situacionForm.value;

      if (this.isEditing && this.situacionId) {
        // Actualizar
        const situacionToUpdate: SituacionTrabajadorDTO = {
          ...this.situacion!,
          ...formData
        };

        this.situacionTrabajadorService.updateSituacion(this.situacionId, situacionToUpdate).subscribe({
          next: () => {
            this.notificationService.show('Situación actualizada exitosamente', 'success');
            this.router.navigate(['/situacion-trabajador']);
          },
          error: (error: any) => {
            console.error('Error actualizando situación:', error);
            this.notificationService.show('Error al actualizar la situación', 'error');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newSituacion: SituacionTrabajadorDTO = {
          nombre: formData.nombre,
          activo: formData.activo
        };

        this.situacionTrabajadorService.createSituacion(newSituacion).subscribe({
          next: () => {
            this.notificationService.show('Situación creada exitosamente', 'success');
            this.router.navigate(['/situacion-trabajador']);
          },
          error: (error: any) => {
            console.error('Error creando situación:', error);
            this.notificationService.show('Error al crear la situación', 'error');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/situacion-trabajador']);
  }

  onEdit(): void {
    if (this.situacionId) {
      this.router.navigate(['/situacion-trabajador/edit', this.situacionId]);
    }
  }

  onDelete(): void {
    if (this.situacion && confirm(`¿Estás seguro de que deseas eliminar la situación "${this.situacion.nombre}"?`)) {
      if (this.situacion.idSituacion) {
        this.situacionTrabajadorService.changeStatus(this.situacion.idSituacion).subscribe({
          next: () => {
            this.notificationService.show('Situación eliminada exitosamente', 'success');
            this.router.navigate(['/situacion-trabajador']);
          },
          error: (error: any) => {
            console.error('Error eliminando situación:', error);
            this.notificationService.show('Error al eliminar la situación', 'error');
          }
        });
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.situacionForm.controls).forEach(key => {
      const control = this.situacionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.situacionForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  getPageTitle(): string {
    if (this.isViewing) return 'Detalle de la Situación';
    if (this.isEditing) return 'Editar Situación';
    return 'Nueva Situación';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) return 'Guardando...';
    if (this.isEditing) return 'Actualizar';
    return 'Crear';
  }
}