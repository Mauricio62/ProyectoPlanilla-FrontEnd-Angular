import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { TrabajadorDTO, PageResponse, EstadoEnum } from '../../../shared/models';
import { CONSTANTS } from '../../../core/config/constants';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-trabajador-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajador-list.component.html',
  styleUrls: ['./trabajador-list.component.css']
})
export class TrabajadorListComponent implements OnInit {
  trabajadores$: Observable<PageResponse<TrabajadorDTO>> = of();
  
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
    private trabajadorService: TrabajadorService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    console.log('Inicializando componente TrabajadorListComponent');
    this.trabajadores$ = this.filters$.pipe(
      switchMap(({estado, page, size, search}) => {
        console.log('Solicitando trabajadores con filtros:', {estado, page, size, search});
        return this.trabajadorService.listar(estado, search, page, size).pipe(
          catchError(error => {
            console.error('Error cargando trabajadores:', error);
            console.error('Error details:', {
              status: error.status,
              message: error.message,
              url: error.url
            });
            return of({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
              first: page === 0,
              last: false
            } as PageResponse<TrabajadorDTO>);
          })
        );
      })
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

  // Métodos de navegación
  createTrabajador(): void {
    this.router.navigate(['/trabajador/create']);
  }

  viewTrabajador(id: number): void {
    this.router.navigate(['/trabajador/view', id]);
  }

  editTrabajador(id: number): void {
    this.router.navigate(['/trabajador/edit', id]);
  }

  // Métodos de acciones
  toggleEstado(trabajador: TrabajadorDTO): void {
    if (trabajador.idTrabajador) {
      this.trabajadorService.cambiarEstado(trabajador.idTrabajador).subscribe({
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

  onCancel(): void {
    this.router.navigate(['/main-menu']);
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

  trackByTrabajador(index: number, trabajador: TrabajadorDTO): number {
    return trabajador.idTrabajador || index;
  }

  getNombreCompleto(trabajador: TrabajadorDTO): string {
    const nombres = trabajador.nombres || '';
    const apellidoPaterno = trabajador.apellidoPaterno || '';
    const apellidoMaterno = trabajador.apellidoMaterno || '';
    return `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim();
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}
