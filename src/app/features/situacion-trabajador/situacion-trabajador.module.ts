import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SituacionTrabajadorListComponent } from './situacion-trabajador-list/situacion-trabajador-list.component';
import { SituacionTrabajadorFormComponent } from './situacion-trabajador-form/situacion-trabajador-form.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: SituacionTrabajadorListComponent
  },
  {
    path: 'create',
    component: SituacionTrabajadorFormComponent
  },
  {
    path: 'edit/:id',
    component: SituacionTrabajadorFormComponent
  },
        {
          path: 'view/:id',
          component: SituacionTrabajadorFormComponent
        }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SituacionTrabajadorListComponent,
    SituacionTrabajadorFormComponent
  ]
})
export class SituacionTrabajadorModule { }
