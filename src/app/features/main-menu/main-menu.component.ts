import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;
  currentUser: User | null = null;
  isChatOpen: boolean = false;
  
  menuItems = [
 /*
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Panel principal con estadísticas y resumen',
      icon: '📊',
      route: '/dashboard',
      color: 'primary'
    },*/
    {
      id: 'cargo',
      title: 'Gestión de Cargos',
      description: 'Administrar cargos, crear, editar y listar',
      icon: '💼',
      route: '/cargo',
      color: 'success'
    },
    {
      id: 'asistencia',
      title: 'Control de Asistencias',
      description: 'Gestionar asistencias, cargar Excel y reportes',
      icon: '⏰',
      route: '/asistencia',
      color: 'info'
    },
    {
      id: 'situacion-trabajador',
      title: 'Situaciones de Trabajador',
      description: 'Administrar situaciones laborales',
      icon: '👷',
      route: '/situacion-trabajador',
      color: 'warning'
    },
    {
      id: 'genero',
      title: 'Géneros',
      description: 'Gestionar catálogo de géneros',
      icon: '👥',
      route: '/genero',
      color: 'secondary'
    },
    {
      id: 'sistema-pension',
      title: 'Sistemas de Pensión',
      description: 'Administrar sistemas de pensión',
      icon: '🏦',
      route: '/sistema-pension',
      color: 'dark'
    },
    {
      id: 'tipo-documento',
      title: 'Tipos de Documento',
      description: 'Gestionar tipos de documentos',
      icon: '📄',
      route: '/tipo-documento',
      color: 'primary'
    },
    {
      id: 'estado-civil',
      title: 'Estados Civiles',
      description: 'Administrar estados civiles',
      icon: '💍',
      route: '/estado-civil',
      color: 'success'
    },
    {
      id: 'trabajador',
      title: 'Gestión de Trabajadores',
      description: 'Administrar información de trabajadores',
      icon: '👤',
      route: '/trabajador',
      color: 'info'
    },
    {
      id: 'planillas',
      title: 'Planillas',
      description: 'Generar y gestionar planillas de pago',
      icon: '💰',
      route: '/planilla-mensual',
      color: 'warning',
      disabled: false
    }
    /*  ,
  {
      id: 'reportes',
      title: 'Reportes',
      description: 'Generar reportes y estadísticas',
      icon: '📈',
      route: '/reportes',
      color: 'secondary',
      disabled: true
    },
    {
      id: 'configuracion',
      title: 'Configuración',
      description: 'Configuraciones del sistema',
      icon: '⚙️',
      route: '/configuracion',
      color: 'dark',
      disabled: true
    }*/
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('❌ Error cargando usuario en menú:', error);
      }
    });
  }

  onMenuItemClick(item: any): void {
    if (item.disabled) {
      console.log('⚠️ Opción deshabilitada:', item.title);
      return;
    }
    this.router.navigate([item.route]);
  }

  logout(): void {
    this.authService.logout();
  }

  getCardClass(item: any): string {
    const baseClass = 'menu-card';
    const colorClass = `card-${item.color}`;
    const disabledClass = item.disabled ? 'card-disabled' : '';
    
    return `${baseClass} ${colorClass} ${disabledClass}`.trim();
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  closeChat(): void {
    this.isChatOpen = false;
  }

  clearChat(): void {
    if (this.chatComponent) {
      this.chatComponent.clearChat();
    }
  }
}
