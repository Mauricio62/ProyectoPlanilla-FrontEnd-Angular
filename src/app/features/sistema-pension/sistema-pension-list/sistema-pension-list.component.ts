import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SistemaPensionService } from '../../../core/services/sistema-pension.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SistemaPensionDTO, EstadoEnum, PageResponse } from '../../../shared/models';
import { BehaviorSubject, Observable, of, switchMap, catchError } from 'rxjs';
import { CONSTANTS } from '../../../core/config/constants';

@Component({
  selector: 'app-sistema-pension-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sistema-pension-list.component.html',
  styleUrls: ['./sistema-pension-list.component.css']
})
export class SistemaPensionListComponent implements OnInit {
  sistemasPension$: Observable<PageResponse<SistemaPensionDTO>> = of();
  
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
    private sistemaPensionService: SistemaPensionService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.sistemasPension$ = this.filters$.pipe(
      switchMap(({estado, page, size, search}) => 
        this.sistemaPensionService.getSistemasPension(estado, search, page, size).pipe(
          catchError(error => {
            console.error('Error cargando sistemas de pensión:', error);
            return of({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
              first: page === 0,
              last: false
            } as PageResponse<SistemaPensionDTO>);
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

  // Métodos de navegación
  createSistemaPension(): void {
    this.router.navigate(['/sistema-pension/create']);
  }

  viewSistemaPension(id: number): void {
    this.router.navigate(['/sistema-pension/view', id]);
  }

  editSistemaPension(id: number): void {
    this.router.navigate(['/sistema-pension/edit', id]);
  }

  // Métodos de acciones
  toggleEstado(sistemaPension: SistemaPensionDTO): void {
    if (sistemaPension.idSistemaPension) {
      this.sistemaPensionService.changeStatus(sistemaPension.idSistemaPension).subscribe({
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

  trackBySistemaPension(index: number, sistemaPension: SistemaPensionDTO): number {
    return sistemaPension.idSistemaPension || index;
  }
}
