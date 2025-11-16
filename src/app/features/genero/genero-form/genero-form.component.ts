import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneroService } from '../../../core/services/genero.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GeneroDTO } from '../../../shared/models';

@Component({
  selector: 'app-genero-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './genero-form.component.html',
  styleUrls: ['./genero-form.component.css']
})
export class GeneroFormComponent implements OnInit {
  generoForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  generoId: number | null = null;
  genero: GeneroDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private generoService: GeneroService,
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
    this.generoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
       activo: [true]
    });
  }

  private setupCreateMode(): void {
    this.isEditing = false;
    this.isViewing = false;
    this.generoId = null;
    this.genero = null;
    this.generoForm.reset({ activo: true });
    this.generoForm.enable();
  }

  private setupEditMode(id: number): void {
    this.isEditing = true;
    this.isViewing = false;
    this.generoId = id;
    this.loadGenero(id);
    this.generoForm.enable();
  }

  private setupViewMode(id: number): void {
    this.isEditing = false;
    this.isViewing = true;
    this.generoId = id;
    this.loadGenero(id);
    this.generoForm.disable();
  }

  private loadGenero(id: number): void {
    this.generoService.getGeneroById(id).subscribe({

      next: (response) => {
        this.genero = response;
        this.generoForm.patchValue({
          nombre: this.genero.nombre,
          activo: this.genero.activo
        });
      },
      error: (error) => {
        console.error('Error cargando género:', error);
        this.notificationService.showError('Error al cargar el género');
        this.router.navigate(['/genero']);
      }
    });
  }

  onSubmit(): void {
    if (this.generoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.generoForm.value;

      if (this.isEditing && this.generoId) {
        // Actualizar
        const generoToUpdate: GeneroDTO = {
          ...this.genero!,
          ...formData
        };

        this.generoService.updateGenero(this.generoId, generoToUpdate).subscribe({
          next: () => {
            this.notificationService.showSuccess('Género actualizado exitosamente');
            this.router.navigate(['/genero']);
          },
          error: (error: any) => {
            console.error('Error actualizando género:', error);
            this.notificationService.showError('Error al actualizar el género');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newGenero: GeneroDTO = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          activo: formData.activo
        };

        this.generoService.createGenero(newGenero).subscribe({
          next: () => {
            this.notificationService.showSuccess('Género creado exitosamente');
            this.router.navigate(['/genero']);
          },
          error: (error: any) => {
            console.error('Error creando género:', error);
            this.notificationService.showError('Error al crear el género');
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
    this.router.navigate(['/genero']);
  }

  onEdit(): void {
    if (this.generoId) {
      this.router.navigate(['/genero/edit', this.generoId]);
    }
  }
toggleEstado(): void {
    if (this.genero?.idGenero) {
      this.generoService.changeStatus(this.genero.idGenero).subscribe({
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
    Object.keys(this.generoForm.controls).forEach(key => {
      const control = this.generoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.generoForm.get(fieldName);
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
    if (this.isViewing) return 'Detalle del Género';
    if (this.isEditing) return 'Editar Género';
    return 'Nuevo Género';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) return 'Guardando...';
    if (this.isEditing) return 'Actualizar';
    return 'Crear';
  }
}
