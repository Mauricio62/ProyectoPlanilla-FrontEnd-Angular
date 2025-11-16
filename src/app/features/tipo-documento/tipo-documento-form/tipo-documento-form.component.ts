import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TipoDocumentoDTO } from '../../../shared/models';

@Component({
  selector: 'app-tipo-documento-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tipo-documento-form.component.html',
  styleUrls: ['./tipo-documento-form.component.css']
})
export class TipoDocumentoFormComponent implements OnInit {
  tipoForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  tipoId: number | null = null;
  tipo: TipoDocumentoDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tipoDocumentoService: TipoDocumentoService,
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
    this.tipoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      activo: [true]
    });
  }

  private setupCreateMode(): void {
    this.isEditing = false;
    this.isViewing = false;
    this.tipoId = null;
    this.tipo = null;
    this.tipoForm.reset({ activo: true });
    this.tipoForm.enable();
  }

  private setupEditMode(id: number): void {
    this.isEditing = true;
    this.isViewing = false;
    this.tipoId = id;
    this.loadTipo(id);
    this.tipoForm.enable();
  }

  private setupViewMode(id: number): void {
    this.isEditing = false;
    this.isViewing = true;
    this.tipoId = id;
    this.loadTipo(id);
    this.tipoForm.disable();
  }

  private loadTipo(id: number): void {
    this.tipoDocumentoService.getTipoDocumentoById(id).subscribe({
      next: (response) => {
        this.tipo = response;
        this.tipoForm.patchValue({
          nombre: this.tipo.nombre,
          activo: this.tipo.activo
        });
      },
      error: (error) => {
        console.error('Error cargando tipo de documento:', error);
        this.notificationService.showError('Error al cargar el tipo de documento');
        this.router.navigate(['/tipo-documento']);
      }
    });
  }

  onSubmit(): void {
    if (this.tipoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.tipoForm.value;

      if (this.isEditing && this.tipoId) {
        // Actualizar
        const tipoToUpdate: TipoDocumentoDTO = {
          ...this.tipo!,
          ...formData
        };

        this.tipoDocumentoService.updateTipoDocumento(this.tipoId, tipoToUpdate).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tipo de documento actualizado exitosamente');
            this.router.navigate(['/tipo-documento']);
          },
          error: (error: any) => {
            console.error('Error actualizando tipo de documento:', error);
            this.notificationService.showError('Error al actualizar el tipo de documento');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newTipo: TipoDocumentoDTO = {
          nombre: formData.nombre,
          activo: formData.activo
        };

        this.tipoDocumentoService.createTipoDocumento(newTipo).subscribe({
          next: () => {
            this.notificationService.showSuccess('Tipo de documento creado exitosamente');
            this.router.navigate(['/tipo-documento']);
          },
          error: (error: any) => {
            console.error('Error creando tipo de documento:', error);
            this.notificationService.showError('Error al crear el tipo de documento');
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
    this.router.navigate(['/tipo-documento']);
  }

  onEdit(): void {
    if (this.tipoId) {
      this.router.navigate(['/tipo-documento/editar', this.tipoId]);
    }
  }

toggleEstado(): void {
    if (this.tipo?.idTipoDocumento) {
      this.tipoDocumentoService.changeStatus(this.tipo.idTipoDocumento).subscribe({
        next: () => {
          this.notificationService.show('Estado cambiado exitosamente', 'success');
          this.router.navigate(['/tipo-documento']);
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.notificationService.show('Error al cambiar el estado', 'error');
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tipoForm.controls).forEach(key => {
      const control = this.tipoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.tipoForm.get(fieldName);
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
    if (this.isViewing) return 'Detalle del Tipo de Documento';
    if (this.isEditing) return 'Editar Tipo de Documento';
    return 'Nuevo Tipo de Documento';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) return 'Guardando...';
    if (this.isEditing) return 'Actualizar';
    return 'Crear';
  }
}
