import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadoCivilService } from '../../../core/services/estado-civil.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EstadoCivilDTO, EstadoEnum, PageResponse } from '../../../shared/models';
import { BehaviorSubject, Observable, of, switchMap, catchError } from 'rxjs';
import { CONSTANTS } from '../../../core/config/constants';

@Component({
  selector: 'app-estado-civil-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estado-civil-list.component.html',
  styleUrls: ['./estado-civil-list.component.css']
})
export class EstadoCivilListComponent implements OnInit {
  estadosCiviles$: Observable<PageResponse<EstadoCivilDTO>> = of();
  
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
    private estadoCivilService: EstadoCivilService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.estadosCiviles$ = this.filters$.pipe(
      switchMap(({estado, page, size, search}) => 
        this.estadoCivilService.getEstadosCiviles(estado, search, page, size).pipe(
          catchError(error => {
            console.error('Error cargando estados civiles:', error);
            return of({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
              first: page === 0,
              last: false
            } as PageResponse<EstadoCivilDTO>);
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
  onCancel(): void {
    this.router.navigate(['/main-menu']);
  }
  // Métodos de navegación
  createEstadoCivil(): void {
    this.router.navigate(['/estado-civil/create']);
  }

  viewEstadoCivil(id: number): void {
    this.router.navigate(['/estado-civil/view', id]);
  }

  editEstadoCivil(id: number): void {
    this.router.navigate(['/estado-civil/edit', id]);
  }

  // Métodos de acciones
  toggleEstado(estadoCivil: EstadoCivilDTO): void {
    if (estadoCivil.idEstadoCivil) {
      this.estadoCivilService.changeStatus(estadoCivil.idEstadoCivil).subscribe({
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

  trackByEstadoCivil(index: number, estadoCivil: EstadoCivilDTO): number {
    return estadoCivil.idEstadoCivil || index;
  }
}
