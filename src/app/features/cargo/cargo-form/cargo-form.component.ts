import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CargoDTO } from '../../../shared/models';
import { CargoService } from '../../../core/services/cargo.service';

@Component({
  selector: 'app-cargo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cargo-form.component.html',
  styleUrls: ['./cargo-form.component.css']
})
export class CargoFormComponent implements OnInit {
  cargoForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  cargoId: number | null = null;
  cargo: CargoDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cargoService: CargoService,
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
    this.cargoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      activo: [true]
    });
  }

  private setupCreateMode(): void {
    this.isEditing = false;
    this.isViewing = false;
    this.cargoId = null;
    this.cargo = null;
    this.cargoForm.reset({ activo: true });
    this.cargoForm.enable();
  }

  private setupEditMode(id: number): void {
    this.isEditing = true;
    this.isViewing = false;
    this.cargoId = id;
    this.loadCargo(id);
    this.cargoForm.enable();
  }

  private setupViewMode(id: number): void {
    this.isEditing = false;
    this.isViewing = true;
    this.cargoId = id;
    this.loadCargo(id);
    this.cargoForm.disable();
  }

  private loadCargo(id: number): void {
    this.cargoService.obtenerPorId(id).subscribe({
      next: (cargo) => {
        this.cargo = cargo;
        this.cargoForm.patchValue({
          nombre: cargo.nombre,
          activo: cargo.activo
        });
      },
      error: (error) => {
        console.error('Error cargando cargo:', error);
        this.notificationService.show('Error al cargar el cargo', 'error');
        this.router.navigate(['/cargo']);
      }
    });
  }

  onSubmit(): void {
    if (this.cargoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.cargoForm.value;

      if (this.isEditing && this.cargoId) {
        // Actualizar
        const cargoToUpdate: CargoDTO = {
          ...this.cargo!,
          ...formData
        };

        this.cargoService.actualizar(this.cargoId, cargoToUpdate).subscribe({
          next: () => {
            this.notificationService.show('Cargo actualizado exitosamente', 'success');
            this.router.navigate(['/cargo']);
          },
          error: (error: any) => {
            console.error('Error actualizando cargo:', error);
            this.notificationService.show('Error al actualizar el cargo', 'error');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newCargo: CargoDTO = {
          nombre: formData.nombre,
          activo: formData.activo
        };

        this.cargoService.crear(newCargo).subscribe({
          next: () => {
            this.notificationService.show('Cargo creado exitosamente', 'success');
            this.router.navigate(['/cargo']);
          },
          error: (error: any) => {
            console.error('Error creando cargo:', error);
            this.notificationService.show('Error al crear el cargo', 'error');
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
    this.router.navigate(['/cargo']);
  }

  onEdit(): void {
    if (this.cargoId) {
      this.router.navigate(['/cargo/edit', this.cargoId]);
    }
  }
  toggleEstado(): void {
    if (this.cargo?.idCargo) {
      this.cargoService.cambiarEstado(this.cargo.idCargo).subscribe({
        next: () => {
          this.notificationService.show('Estado cambiado exitosamente', 'success');
          this.router.navigate(['/cargo']);
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.notificationService.show('Error al cambiar el estado', 'error');
        }
      });
    }
  }
  
  private markFormGroupTouched(): void {
    Object.keys(this.cargoForm.controls).forEach(key => {
      const control = this.cargoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.cargoForm.get(fieldName);
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
    if (this.isViewing) return 'Detalle del Cargo';
    if (this.isEditing) return 'Editar Cargo';
    return 'Nuevo Cargo';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) return 'Guardando...';
    if (this.isEditing) return 'Actualizar';
    return 'Crear';
  }
}
