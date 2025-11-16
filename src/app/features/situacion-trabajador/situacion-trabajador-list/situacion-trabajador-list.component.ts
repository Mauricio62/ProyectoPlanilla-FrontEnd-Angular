import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SituacionTrabajadorService } from '../../../core/services/situacion-trabajador.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SituacionTrabajadorDTO, EstadoEnum, PageResponse } from '../../../shared/models';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';
import { CONSTANTS } from '../../../core/config/constants';

@Component({
  selector: 'app-situacion-trabajador-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './situacion-trabajador-list.component.html',
  styleUrls: ['./situacion-trabajador-list.component.css']
})
export class SituacionTrabajadorListComponent implements OnInit {
  situaciones$: Observable<PageResponse<SituacionTrabajadorDTO>> = of();
  
  // Variables para mantener el estado actual
  currentPage = 0;
  pageSize = CONSTANTS.PAGINATION.DEFAULT_SIZE;
  selectedEstado: EstadoEnum = EstadoEnum.TODOS;
  searchTerm = '';
  
  // Subject para manejar los cambios en los filtros
  private filters$ = new BehaviorSubject<{estado: EstadoEnum, page: number, size: number, search: string}>({
    estado: this.selectedEstado,
    page: this.currentPage,
    size: this.pageSize,
    search: this.searchTerm
  });

  estadoOptions = [
    { value: EstadoEnum.TODOS, label: 'Todos' },
    { value: EstadoEnum.ACTIVO, label: 'Activo' },
    { value: EstadoEnum.INACTIVO, label: 'Inactivo' }
  ];

  constructor(
    private situacionTrabajadorService: SituacionTrabajadorService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.situaciones$ = this.filters$.pipe(
      switchMap(({estado, page, size, search}) => 
        this.situacionTrabajadorService.getSituaciones(estado, search, page, size).pipe(
          catchError(error => {
            console.error('Error cargando situaciones de trabajador:', error);
            this.notificationService.show('Error al cargar las situaciones de trabajador', 'error');
            return of({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
              first: page === 0,
              last: false
            } as PageResponse<SituacionTrabajadorDTO>);
          })
        )
      )
    );
  }

  // Métodos de filtrado y búsqueda
  onEstadoChange(): void {
    this.currentPage = 0;
    this.updateFilters();
  }
  onCancel(): void {
    this.router.navigate(['/main-menu']);
  }
  onSearchChange(): void {
    this.currentPage = 0;
    this.updateFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateFilters();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.updateFilters();
  }

  private updateFilters(): void {
    this.filters$.next({
      estado: this.selectedEstado,
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm
    });
  }

  // Métodos de navegación
  createSituacionTrabajador(): void {
    this.router.navigate(['/situacion-trabajador/create']);
  }

  viewSituacionTrabajador(id: number): void {
    this.router.navigate(['/situacion-trabajador/view', id]);
  }

  editSituacionTrabajador(id: number): void {
    this.router.navigate(['/situacion-trabajador/edit', id]);
  }

  // Métodos de acciones
  toggleEstado(situacion: SituacionTrabajadorDTO): void {
    if (situacion.idSituacion) {
      this.situacionTrabajadorService.changeStatus(situacion.idSituacion).subscribe({
        next: () => {
          this.notificationService.show('Estado cambiado exitosamente', 'success');
          this.updateFilters();
        },
        error: (error: any) => {
          console.error('Error changing status:', error);
          this.notificationService.show('Error al cambiar el estado', 'error');
        }
      });
    }
  }

  
  // Métodos de utilidad
  getEstadoClass(estado: boolean): string {
    return estado ? 'status-active' : 'status-inactive';
  }

  getPaginationRange(totalPages: number): number[] {
    const range = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(totalPages - 1, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }

  trackBySituacion(index: number, situacion: SituacionTrabajadorDTO): number {
    return situacion.idSituacion || index;
  }
}
