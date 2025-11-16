import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneroListComponent } from './genero-list/genero-list.component';
import { GeneroFormComponent } from './genero-form/genero-form.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: GeneroListComponent
  },
  {
    path: 'create',
    component: GeneroFormComponent
  },
  {
    path: 'edit/:id',
    component: GeneroFormComponent
  },
    {
      path: 'view/:id',
      component: GeneroFormComponent
    }
];

@NgModule({
  imports: [CommonModule,
    RouterModule.forChild(routes),
    GeneroListComponent,
    GeneroFormComponent],

})
export class GeneroModule { }
