import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NotificationService } from '../../../core/services/notification.service';
import { TrabajadorDTO, GeneroDTO, EstadoCivilDTO, CargoDTO, SituacionTrabajadorDTO, SistemaPensionDTO, TipoDocumentoDTO, EstadoEnum } from '../../../shared/models';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { GeneroService } from '../../../core/services/genero.service';
import { EstadoCivilService } from '../../../core/services/estado-civil.service';
import { CargoService } from '../../../core/services/cargo.service';
import { SituacionTrabajadorService } from '../../../core/services/situacion-trabajador.service';
import { SistemaPensionService } from '../../../core/services/sistema-pension.service';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';

@Component({
  selector: 'app-trabajador-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trabajador-form.component.html',
  styleUrls: ['./trabajador-form.component.css']
})
export class TrabajadorFormComponent implements OnInit {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trabajadorService = inject(TrabajadorService);
  private generoService = inject(GeneroService);
  private estadoCivilService = inject(EstadoCivilService);
  private cargoService = inject(CargoService);
  private situacionTrabajadorService = inject(SituacionTrabajadorService);
  private sistemaPensionService = inject(SistemaPensionService);
  private tipoDocumentoService = inject(TipoDocumentoService);
  private notificationService = inject(NotificationService);

  // Signals para el estado
  isSubmitting = signal(false);
  isEditing = signal(false);
  isViewing = signal(false);
  isLoading = signal(true);
  hasError = signal(false);
  
  trabajadorId: number | null = null;
  trabajador: TrabajadorDTO | null = null;

  // Signals para datos
  tiposDocumento = signal<TipoDocumentoDTO[]>([]);
  generos = signal<GeneroDTO[]>([]);
  estadosCiviles = signal<EstadoCivilDTO[]>([]);
  cargos = signal<CargoDTO[]>([]);
  situaciones = signal<SituacionTrabajadorDTO[]>([]);
  sistemasPension = signal<SistemaPensionDTO[]>([]);

  trabajadorForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadSelectData();
    this.checkRoute();
  }

  private initForm(): void {
    this.trabajadorForm = this.fb.group({
      idTipoDocumento: [{value: '', disabled: false}, Validators.required],
      documento: [{value: '', disabled: false}, [Validators.required, Validators.minLength(8)]],
      nombres: [{value: '', disabled: false}, [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: [{value: '', disabled: false}, [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: [{value: '', disabled: false}, Validators.minLength(2)],
      idGenero: [{value: '', disabled: false}, Validators.required],
      idEstadoCivil: [{value: '', disabled: false}, Validators.required],
      direccion: [{value: '', disabled: false}, [Validators.required, Validators.minLength(10)]],
      email: [{value: '', disabled: false}, [Validators.required, Validators.email]],
      hijos: [{value: 0, disabled: false}, [Validators.required, Validators.min(0)]],
      idCargo: [{value: '', disabled: false}, Validators.required],
      fecNacimiento: [{value: '', disabled: false}, Validators.required],
      fecIngreso: [{value: '', disabled: false}, Validators.required],
      idSituacion: [{value: '', disabled: false}, Validators.required],
      idSistemaPension: [{value: '', disabled: false}, Validators.required],
      activo: [{value: true, disabled: false}]
    });
  }

  private checkRoute(): void {
    this.route.url.subscribe(segments => {
      const path = segments.map(s => s.path).join('/');
      
      if (path.includes('create')) {
        this.isEditing.set(false);
        this.isViewing.set(false);
      } else if (path.includes('edit')) {
        this.isEditing.set(true);
        this.isViewing.set(false);
        this.route.params.subscribe(params => {
          this.trabajadorId = +params['id'];
          if (this.trabajadorId) {
            this.loadTrabajador(this.trabajadorId);
          }
        });
      } else if (path.includes('view')) {
        this.isViewing.set(true);
        this.isEditing.set(false);
        this.route.params.subscribe(params => {
          this.trabajadorId = +params['id'];
          if (this.trabajadorId) {
            this.loadTrabajador(this.trabajadorId);
          }
        });
      }
    });
  }

  private loadSelectData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      tiposDocumento: this.tipoDocumentoService.getTiposDocumento(EstadoEnum.ACTIVO),
      generos: this.generoService.getGeneros(EstadoEnum.ACTIVO),
      estadosCiviles: this.estadoCivilService.getEstadosCiviles(EstadoEnum.ACTIVO),
      cargos: this.cargoService.listar(EstadoEnum.ACTIVO),
      situaciones: this.situacionTrabajadorService.getSituaciones(EstadoEnum.ACTIVO),
      sistemasPension: this.sistemaPensionService.getSistemasPension(EstadoEnum.ACTIVO)
    }).subscribe({
      next: (responses) => {
        this.tiposDocumento.set(responses.tiposDocumento.content || []);
        this.generos.set(responses.generos.content || []);
        this.estadosCiviles.set(responses.estadosCiviles.content || []);
        this.cargos.set(responses.cargos.content || []);
        this.situaciones.set(responses.situaciones.content || []);
        this.sistemasPension.set(responses.sistemasPension.content || []);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.notificationService.show('Error al cargar los datos del formulario', 'error');
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  private loadTrabajador(id: number): void {
    this.isLoading.set(true);
    
    this.trabajadorService.obtenerPorId(id).subscribe({
      next: (trabajador) => {
        this.trabajador = trabajador;
        this.trabajadorForm.patchValue({
          idTipoDocumento: trabajador.idTipoDocumento,
          documento: trabajador.documento,
          nombres: trabajador.nombres,
          apellidoPaterno: trabajador.apellidoPaterno,
          apellidoMaterno: trabajador.apellidoMaterno,
          idGenero: trabajador.idGenero,
          idEstadoCivil: trabajador.idEstadoCivil,
          direccion: trabajador.direccion,
          email: trabajador.email,
          hijos: trabajador.hijos,
          idCargo: trabajador.idCargo,
          fecNacimiento: trabajador.fecNacimiento ? new Date(trabajador.fecNacimiento).toISOString().split('T')[0] : '',
          fecIngreso: trabajador.fecIngreso ? new Date(trabajador.fecIngreso).toISOString().split('T')[0] : '',
          idSituacion: trabajador.idSituacion,
          idSistemaPension: trabajador.idSistemaPension,
          activo: trabajador.activo
        });

        if (this.isViewing()) {
          this.trabajadorForm.disable();
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando trabajador:', error);
        this.notificationService.show('Error al cargar el trabajador', 'error');
        this.isLoading.set(false);
        this.hasError.set(true);
        this.router.navigate(['/trabajador']);
      }
    });
  }

  onSubmit(): void {
    if (this.trabajadorForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      const formData = this.trabajadorForm.value;

      if (this.isEditing() && this.trabajadorId) {
        // Actualizar
        const trabajadorToUpdate: TrabajadorDTO = {
          ...this.trabajador!,
          ...formData
        };

        this.trabajadorService.actualizar(this.trabajadorId, trabajadorToUpdate).subscribe({
          next: () => {
            this.notificationService.show('Trabajador actualizado exitosamente', 'success');
            this.router.navigate(['/trabajador']);
          },
          error: (error: any) => {
            console.error('Error actualizando trabajador:', error);
            this.notificationService.show('Error al actualizar el trabajador', 'error');
            this.isSubmitting.set(false);
          }
        });
      } else {
        // Crear
        const newTrabajador: TrabajadorDTO = {
          idTipoDocumento: formData.idTipoDocumento,
          documento: formData.documento,
          nombres: formData.nombres,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          idGenero: formData.idGenero,
          idEstadoCivil: formData.idEstadoCivil,
          direccion: formData.direccion,
          email: formData.email,
          hijos: formData.hijos,
          idCargo: formData.idCargo,
          fecNacimiento: new Date(formData.fecNacimiento),
          fecIngreso: new Date(formData.fecIngreso),
          idSituacion: formData.idSituacion,
          idSistemaPension: formData.idSistemaPension,
          activo: formData.activo
        };

        this.trabajadorService.crear(newTrabajador).subscribe({
          next: () => {
            this.notificationService.show('Trabajador creado exitosamente', 'success');
            this.router.navigate(['/trabajador']);
          },
          error: (error: any) => {
            console.error('Error creando trabajador:', error);
            this.notificationService.show('Error al crear el trabajador', 'error');
            this.isSubmitting.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/trabajador']);
  }

  onRetry(): void {
    this.hasError.set(false);
    this.loadSelectData();
    if (this.trabajadorId) {
      this.loadTrabajador(this.trabajadorId);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.trabajadorForm.controls).forEach(key => {
      const control = this.trabajadorForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.trabajadorForm.get(fieldName);
    if (field?.errors && (field.touched || field.dirty)) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.trabajadorForm.get(fieldName);
    return !!(field?.invalid && (field.touched || field.dirty));
  }
}
/*
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { TrabajadorDTO, GeneroDTO, EstadoCivilDTO, CargoDTO, SituacionTrabajadorDTO, SistemaPensionDTO, TipoDocumentoDTO, EstadoEnum } from '../../../shared/models';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { GeneroService } from '../../../core/services/genero.service';
import { EstadoCivilService } from '../../../core/services/estado-civil.service';
import { CargoService } from '../../../core/services/cargo.service';
import { SituacionTrabajadorService } from '../../../core/services/situacion-trabajador.service';
import { SistemaPensionService } from '../../../core/services/sistema-pension.service';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';

@Component({
  selector: 'app-trabajador-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trabajador-form.component.html',
  styleUrls: ['./trabajador-form.component.css']
})
export class TrabajadorFormComponent implements OnInit {
  trabajadorForm!: FormGroup;
  isSubmitting = false;
  isEditing = false;
  isViewing = false;
  trabajadorId: number | null = null;
  trabajador: TrabajadorDTO | null = null;

  // Datos para los selects
  tiposDocumento: TipoDocumentoDTO[] = [];
  generos: GeneroDTO[] = [];
  estadosCiviles: EstadoCivilDTO[] = [];
  cargos: CargoDTO[] = [];
  situaciones: SituacionTrabajadorDTO[] = [];
  sistemasPension: SistemaPensionDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private trabajadorService: TrabajadorService,
    private generoService: GeneroService,
    private estadoCivilService: EstadoCivilService,
    private cargoService: CargoService,
    private situacionTrabajadorService: SituacionTrabajadorService,
    private sistemaPensionService: SistemaPensionService,
    private tipoDocumentoService: TipoDocumentoService,
    private notificationService: NotificationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Cargar datos para los selects
    this.loadSelectData();
    
    this.route.url.subscribe(segments => {
      const path = segments.map(s => s.path).join('/');
      
      if (path.includes('create')) {
        this.isEditing = false;
        this.isViewing = false;
      } else if (path.includes('edit')) {
        this.isEditing = true;
        this.isViewing = false;
        this.route.params.subscribe(params => {
          this.trabajadorId = +params['id'];
          if (this.trabajadorId) {
            this.loadTrabajador(this.trabajadorId);
          }
        });
      } else if (path.includes('view')) {
        this.isViewing = true;
        this.isEditing = false;
        this.route.params.subscribe(params => {
          this.trabajadorId = +params['id'];
          if (this.trabajadorId) {
            this.loadTrabajador(this.trabajadorId);
          }
        });
      }
    });
  }

  private initForm(): void {
    this.trabajadorForm = this.fb.group({
      idTipoDocumento: ['', Validators.required],
      documento: ['', [Validators.required, Validators.minLength(8)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: ['', Validators.minLength(2)],
      idGenero: ['', Validators.required],
      idEstadoCivil: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      hijos: [0, [Validators.required, Validators.min(0)]],
      idCargo: ['', Validators.required],
      fecNacimiento: ['', Validators.required],
      fecIngreso: ['', Validators.required],
      idSituacion: ['', Validators.required],
      idSistemaPension: ['', Validators.required],
      activo: [true]
    });
  }

  private loadSelectData(): void {
    // Cargar tipos de documento (solo activos)
    this.tipoDocumentoService.getTiposDocumento(EstadoEnum.ACTIVO).subscribe({
      next: (response: any) => {
        this.tiposDocumento = response.content;
      },
      error: (error: any) => {
        console.error('Error cargando tipos de documento:', error);
        this.notificationService.show('Error al cargar tipos de documento', 'error');
      }
    });

    // Cargar géneros (solo activos)
    this.generoService.getGeneros(EstadoEnum.ACTIVO).subscribe({
      next: (response: any) => {
        this.generos = response.content;
      },
      error: (error: any) => {
        console.error('Error cargando géneros:', error);
        this.notificationService.show('Error al cargar géneros', 'error');
      }
    });

    // Cargar estados civiles (solo activos)
    this.estadoCivilService.getEstadosCiviles(EstadoEnum.ACTIVO).subscribe({
      next: (response: any) => {
        this.estadosCiviles = response.content;
      },
      error: (error: any) => {
        console.error('Error cargando estados civiles:', error);
        this.notificationService.show('Error al cargar estados civiles', 'error');
      }
    });

    // Cargar cargos (solo activos)
    this.cargoService.listar(EstadoEnum.ACTIVO).subscribe({
      next: (response: any) => {
        this.cargos = response.content;
      },
      error: (error: any) => {
        console.error('Error cargando cargos:', error);
        this.notificationService.show('Error al cargar cargos', 'error');
      }
    });

    // Cargar situaciones de trabajador (solo activos)
    this.situacionTrabajadorService.getSituaciones(EstadoEnum.ACTIVO).subscribe({
      next: (response: any) => {
        this.situaciones = response.content;
      },
      error: (error: any) => {
        console.error('Error cargando situaciones de trabajador:', error);
        this.notificationService.show('Error al cargar situaciones de trabajador', 'error');
      }
    });

    // Cargar sistemas de pensión (solo activos)
    this.sistemaPensionService.getSistemasPension(EstadoEnum.ACTIVO).subscribe({
      next: (response: any) => {
        this.sistemasPension = response.content;
      },
      error: (error: any) => {
        console.error('Error cargando sistemas de pensión:', error);
        this.notificationService.show('Error al cargar sistemas de pensión', 'error');
      }
    });
  }

  private loadTrabajador(id: number): void {
    this.trabajadorService.obtenerPorId(id).subscribe({
      next: (trabajador) => {
        this.trabajador = trabajador;
        this.trabajadorForm.patchValue({
          idTipoDocumento: trabajador.idTipoDocumento,
          documento: trabajador.documento,
          nombres: trabajador.nombres,
          apellidoPaterno: trabajador.apellidoPaterno,
          apellidoMaterno: trabajador.apellidoMaterno,
          idGenero: trabajador.idGenero,
          idEstadoCivil: trabajador.idEstadoCivil,
          direccion: trabajador.direccion,
          email: trabajador.email,
          hijos: trabajador.hijos,
          idCargo: trabajador.idCargo,
          fecNacimiento: trabajador.fecNacimiento ? new Date(trabajador.fecNacimiento).toISOString().split('T')[0] : '',
          fecIngreso: trabajador.fecIngreso ? new Date(trabajador.fecIngreso).toISOString().split('T')[0] : '',
          idSituacion: trabajador.idSituacion,
          idSistemaPension: trabajador.idSistemaPension,
          activo: trabajador.activo
        });

        if (this.isViewing) {
          this.trabajadorForm.disable();
        }
      },
      error: (error) => {
        console.error('Error cargando trabajador:', error);
        this.notificationService.show('Error al cargar el trabajador', 'error');
        this.router.navigate(['/trabajador']);
      }
    });
  }

  onSubmit(): void {
    if (this.trabajadorForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.trabajadorForm.value;

      if (this.isEditing && this.trabajadorId) {
        // Actualizar
        const trabajadorToUpdate: TrabajadorDTO = {
          ...this.trabajador!,
          ...formData
        };

        this.trabajadorService.actualizar(this.trabajadorId, trabajadorToUpdate).subscribe({
          next: () => {
            this.notificationService.show('Trabajador actualizado exitosamente', 'success');
            this.router.navigate(['/trabajador']);
          },
          error: (error: any) => {
            console.error('Error actualizando trabajador:', error);
            this.notificationService.show('Error al actualizar el trabajador', 'error');
          },
          complete: () => {
            this.isSubmitting = false;
          }
        });
      } else {
        // Crear
        const newTrabajador: TrabajadorDTO = {
          idTipoDocumento: formData.idTipoDocumento,
          documento: formData.documento,
          nombres: formData.nombres,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          idGenero: formData.idGenero,
          idEstadoCivil: formData.idEstadoCivil,
          direccion: formData.direccion,
          email: formData.email,
          hijos: formData.hijos,
          idCargo: formData.idCargo,
          fecNacimiento: new Date(formData.fecNacimiento),
          fecIngreso: new Date(formData.fecIngreso),
          idSituacion: formData.idSituacion,
          idSistemaPension: formData.idSistemaPension,
          activo: formData.activo
        };

        this.trabajadorService.crear(newTrabajador).subscribe({
          next: () => {
            this.notificationService.show('Trabajador creado exitosamente', 'success');
            this.router.navigate(['/trabajador']);
          },
          error: (error: any) => {
            console.error('Error creando trabajador:', error);
            this.notificationService.show('Error al crear el trabajador', 'error');
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
    this.router.navigate(['/trabajador']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.trabajadorForm.controls).forEach(key => {
      const control = this.trabajadorForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.trabajadorForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['email']) {
        return 'Ingrese un email válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `El valor mínimo es ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.trabajadorForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
*/