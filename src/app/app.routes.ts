import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'main-menu',
    loadChildren: () => import('./features/main-menu/main-menu.module').then(m => m.MainMenuModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'cargo',
    loadChildren: () => import('./features/cargo/cargo.module').then(m => m.CargoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'asistencia',
    loadChildren: () => import('./features/asistencia/asistencia.module').then(m => m.AsistenciaModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'situacion-trabajador',
    loadChildren: () => import('./features/situacion-trabajador/situacion-trabajador.module').then(m => m.SituacionTrabajadorModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'genero',
    loadChildren: () => import('./features/genero/genero.module').then(m => m.GeneroModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sistema-pension',
    loadChildren: () => import('./features/sistema-pension/sistema-pension.module').then(m => m.SistemaPensionModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tipo-documento',
    loadChildren: () => import('./features/tipo-documento/tipo-documento.module').then(m => m.TipoDocumentoModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'estado-civil',
    loadChildren: () => import('./features/estado-civil/estado-civil.module').then(m => m.EstadoCivilModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'trabajador',
    loadChildren: () => import('./features/trabajador/trabajador.module').then(m => m.TrabajadorModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'planilla-mensual',
    loadChildren: () => import('./features/planilla-mensual/planilla-mensual-list.module').then(m => m.PlanillaMensualModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
