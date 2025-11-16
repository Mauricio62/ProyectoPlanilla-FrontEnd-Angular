import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SistemaPensionService } from '../../../core/services/sistema-pension.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SistemaPensionDTO } from '../../../shared/models';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-sistema-pension-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sistema-pension-form.component.html',
  styleUrls: ['./sistema-pension-form.component.css']
})

export class SistemaPensionFormComponent implements OnInit {
  sistemapensiones$: Observable<SistemaPensionDTO> = of();
  sistemaForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  sistemaId: number | null = null;
  sistema: SistemaPensionDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sistemaPensionService: SistemaPensionService,
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
    this.sistemaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      aporte: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      comision: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      prima: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      activo: [true]
    });
  }

  private setupCreateMode(): void {
    this.isEditing = false;
    this.isViewing = false;
    this.sistemaId = null;
    this.sistema = null;
    this.sistemaForm.reset({ 
      aporte: 0,
      comision: 0,
      prima: 0,
      activo: true 
    });
    this.sistemaForm.enable();
  }

  private setupEditMode(id: number): void {
    this.isEditing = true;
    this.isViewing = false;
    this.sistemaId = id;
    this.loadSistema(id);
    this.sistemaForm.enable();
  }

  private setupViewMode(id: number): void {
    this.isEditing = false;
    this.isViewing = true;
    this.sistemaId = id;
    console.log("ID del sistema de pensión:", id);
    this.loadSistema(id);
    this.sistemaForm.disable();
  }

  private loadSistema(id: number): void {
    
    this.sistemaPensionService.getSistemaPensionById(id).subscribe({
      next: (response) => {
        this.sistema = response;
          
        this.sistemaForm.patchValue({
          nombre: this.sistema.nombre,
          aporte: this.sistema.aporte || 0,
          comision: this.sistema.comision || 0,
          prima: this.sistema.prima || 0,
          activo: this.sistema.activo
        });
     
      },
      error: (error) => {
        console.error('Error cargando sistema de pensión:', error);
        this.notificationService.showError('Error al cargar el sistema de pensión');
        this.router.navigate(['/sistema-pension']);
      }
    });

  }

  get isActivo(): boolean {
    return this.sistema?.activo || false;
  }

  onSubmit(): void {
    if (this.sistemaForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.sistemaForm.value;

      if (this.isEditing && this.sistemaId) {
        // Actualizar
        const sistemaToUpdate: SistemaPensionDTO = {
          ...this.sistema!,
          ...formData
        };

        this.sistemaPensionService.updateSistemaPension(this.sistemaId, sistemaToUpdate).subscribe({
          next: () => {
            this.notificationService.showSuccess('Sistema de pensión actualizado exitosamente');
            this.router.navigate(['/sistema-pension']);
          },
          error: (error: any) => {
            console.error('Error actualizando sistema de pensión:', error);
            this.notificationService.showError('Error al actualizar el sistema de pensión');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newSistema: SistemaPensionDTO = {
          nombre: formData.nombre,
          aporte: formData.aporte,
          comision: formData.comision,
          prima: formData.prima,
          activo: formData.activo
        };

        this.sistemaPensionService.createSistemaPension(newSistema).subscribe({
          next: () => {
            this.notificationService.showSuccess('Sistema de pensión creado exitosamente');
            this.router.navigate(['/sistema-pension']);
          },
          error: (error: any) => {
            console.error('Error creando sistema de pensión:', error);
            this.notificationService.showError('Error al crear el sistema de pensión');
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
    this.router.navigate(['/sistema-pension']);
  }

  onEdit(): void {
    if (this.sistemaId) {
      this.router.navigate(['/sistema-pension/edit', this.sistemaId]);
    }
  }

  toggleEstado(): void {
    if (this.sistema?.idSistemaPension) {
      this.sistemaPensionService.changeStatus(this.sistema.idSistemaPension).subscribe({
        next: () => {
          this.notificationService.show('Estado cambiado exitosamente', 'success');
          this.router.navigate(['/sistema-pension']);
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.notificationService.show('Error al cambiar el estado', 'error');
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.sistemaForm.controls).forEach(key => {
      const control = this.sistemaForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.sistemaForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} no puede ser menor a ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} no puede ser mayor a ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      aporte: 'Aporte',
      comision: 'Comisión',
      prima: 'Prima de seguro'
    };
    return labels[fieldName] || fieldName;
  }

  getPageTitle(): string {
    if (this.isViewing) return 'Detalle del Sistema de Pensión';
    if (this.isEditing) return 'Editar Sistema de Pensión';
    return 'Nuevo Sistema de Pensión';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) return 'Guardando...';
    if (this.isEditing) return 'Actualizar';
    return 'Crear';
  }
}
