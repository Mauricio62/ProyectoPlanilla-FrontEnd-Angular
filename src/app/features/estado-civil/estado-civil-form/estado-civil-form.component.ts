import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoCivilService } from '../../../core/services/estado-civil.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EstadoCivilDTO } from '../../../shared/models';

@Component({
  selector: 'app-estado-civil-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './estado-civil-form.component.html',
  styleUrls: ['./estado-civil-form.component.css']
})
export class EstadoCivilFormComponent implements OnInit {
  estadoForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  estadoId: number | null = null;
  estado: EstadoCivilDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private estadoCivilService: EstadoCivilService,
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
    this.estadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      activo: [true]
    });
  }

  private setupCreateMode(): void {
    this.isEditing = false;
    this.isViewing = false;
    this.estadoId = null;
    this.estado = null;
    this.estadoForm.reset({ activo: true });
    this.estadoForm.enable();
  }

  private setupEditMode(id: number): void {
    this.isEditing = true;
    this.isViewing = false;
    this.estadoId = id;
    this.loadEstado(id);
    this.estadoForm.enable();
  }

  private setupViewMode(id: number): void {
    this.isEditing = false;
    this.isViewing = true;
    this.estadoId = id;
    this.loadEstado(id);
    this.estadoForm.disable();
  }

   async loadEstado(id: number):Promise< void> {
  await  this.estadoCivilService.getEstadoCivilById(id).subscribe({
      next: (response) => {
        this.estado = response;
        console.log('Estado civil cargado:', this.estado);
        this.estadoForm.patchValue({
          nombre: this.estado.nombre,
           activo: this.estado.activo
        });
        console.log('Formulario actualizado con:', this.estadoForm.value);
      },
      error: (error) => {
        console.error('Error cargando estado civil:', error);
        this.notificationService.showError('Error al cargar el estado civil');
        this.router.navigate(['/estado-civil']);
      }
    });
  }

  onSubmit(): void {
    if (this.estadoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.estadoForm.value;

      if (this.isEditing && this.estadoId) {
        // Actualizar
        const estadoToUpdate: EstadoCivilDTO = {
          ...this.estado!,
          ...formData
        };

        this.estadoCivilService.updateEstadoCivil(this.estadoId, estadoToUpdate).subscribe({
          next: () => {
            this.notificationService.showSuccess('Estado civil actualizado exitosamente');
            this.router.navigate(['/estado-civil']);
          },
          error: (error: any) => {
            console.error('Error actualizando estado civil:', error);
            this.notificationService.showError('Error al actualizar el estado civil');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newEstado: EstadoCivilDTO = {
          nombre: formData.nombre,
          activo: formData.activo
        };

        this.estadoCivilService.createEstadoCivil(newEstado).subscribe({
          next: () => {
            this.notificationService.showSuccess('Estado civil creado exitosamente');
            this.router.navigate(['/estado-civil']);
          },
          error: (error: any) => {
            console.error('Error creando estado civil:', error);
            this.notificationService.showError('Error al crear el estado civil');
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
    this.router.navigate(['/estado-civil']);
  }

  onEdit(): void {
    if (this.estadoId) {
      this.router.navigate(['/estado-civil/edit', this.estadoId]);
    }
  }

toggleEstado(): void {
    if (this.estado?.idEstadoCivil) {
      this.estadoCivilService.changeStatus(this.estado.idEstadoCivil).subscribe({
        next: () => {
          this.notificationService.show('Estado cambiado exitosamente', 'success');
          this.router.navigate(['/genero']);
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.notificationService.show('Error al cambiar el estado', 'error');
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.estadoForm.controls).forEach(key => {
      const control = this.estadoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.estadoForm.get(fieldName);
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
    if (this.isViewing) return 'Detalle del Estado Civil';
    if (this.isEditing) return 'Editar Estado Civil';
    return 'Nuevo Estado Civil';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) return 'Guardando...';
    if (this.isEditing) return 'Actualizar';
    return 'Crear';
  }
}
