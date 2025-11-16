import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CargoDTO, PageResponse, EstadoEnum } from '../../../shared/models';
import { CONSTANTS } from '../../../core/config/constants';
import { CargoService } from '../../../core/services/cargo.service';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-cargo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargo-list.component.html',
  styleUrls: ['./cargo-list.component.css']
})
export class CargoListComponent implements OnInit {
  cargos$: Observable<PageResponse<CargoDTO>> = of();
  
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
    private cargoService: CargoService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargos$ = this.filters$.pipe(
      switchMap(({estado, page, size, search}) => 
        this.cargoService.listar(estado, search, page, size).pipe(
          catchError(error => {
            console.error('Error cargando cargos:', error);
            return of({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: page,
              size: size,
              first: page === 0,
              last: false
            } as PageResponse<CargoDTO>);
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
  createCargo(): void {
    this.router.navigate(['/cargo/create']);
  }

  viewCargo(id: number): void {
    this.router.navigate(['/cargo/view', id]);
  }

  editCargo(id: number): void {
    this.router.navigate(['/cargo/edit', id]);
  }

  // Métodos de acciones
  toggleEstado(cargo: CargoDTO): void {
    if (cargo.idCargo) {
      this.cargoService.cambiarEstado(cargo.idCargo).subscribe({
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

  trackByCargo(index: number, cargo: CargoDTO): number {
    return cargo.idCargo || index;
  }
}