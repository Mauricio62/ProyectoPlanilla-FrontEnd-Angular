import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GeneroService } from '../../../core/services/genero.service';
import { NotificationService } from '../../../core/services/notification.service';
import { GeneroDTO, EstadoEnum, PageResponse } from '../../../shared/models';
import { BehaviorSubject, Observable, of, switchMap, catchError } from 'rxjs';
import { CONSTANTS } from '../../../core/config/constants';

@Component({
  selector: 'app-genero-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './genero-list.component.html',
  styleUrls: ['./genero-list.component.css']
})
export class GeneroListComponent implements OnInit {
  generos$: Observable<PageResponse<GeneroDTO>> = of();
  
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
    private generoService: GeneroService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.generos$ = this.filters$.pipe(
      switchMap(({estado, page, size, search}) => 
        this.generoService.getGeneros(estado, search, page, size).pipe(
          catchError(error => {
            console.error('Error cargando géneros:', error);
            return of({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
              first: page === 0,
              last: false
            } as PageResponse<GeneroDTO>);
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
  onCancel(): void {
    this.router.navigate(['/main-menu']);
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
  createGenero(): void {
    this.router.navigate(['/genero/create']);
  }

  viewGenero(id: number): void {
    this.router.navigate(['/genero/view', id]);
  }

  editGenero(id: number): void {
    this.router.navigate(['/genero/edit', id]);
  }

  // Métodos de acciones
  toggleEstado(genero: GeneroDTO): void {
    if (genero.idGenero) {
      this.generoService.changeStatus(genero.idGenero).subscribe({
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

  deleteGenero(genero: GeneroDTO): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el género "${genero.nombre}"?`)) {
      if (genero.idGenero) {
        this.generoService.deleteGenero(genero.idGenero).subscribe({
          next: () => {
            this.notificationService.show('Género eliminado exitosamente', 'success');
            this.updateFilters();
          },
          error: (error: any) => {
            console.error('Error eliminando género:', error);
            this.notificationService.show('Error al eliminar el género', 'error');
          }
        });
      }
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

  trackByGenero(index: number, genero: GeneroDTO): number {
    return genero.idGenero || index;
  }
}
