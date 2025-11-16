import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TrabajadorListComponent } from './trabajador-list/trabajador-list.component';
import { TrabajadorFormComponent } from './trabajador-form/trabajador-form.component';

const routes: Routes = [
  {
    path: '',
    component: TrabajadorListComponent
  },
  {
    path: 'create',
    component: TrabajadorFormComponent
  },
  {
    path: 'edit/:id',
    component: TrabajadorFormComponent
  },
  {
    path: 'view/:id',
    component: TrabajadorFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class TrabajadorModule { }
