import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadoCivilListComponent } from './estado-civil-list/estado-civil-list.component';
import { EstadoCivilFormComponent } from './estado-civil-form/estado-civil-form.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: EstadoCivilListComponent
  },
  {
    path: 'create',
    component: EstadoCivilFormComponent
  },
  {
    path: 'edit/:id',
    component: EstadoCivilFormComponent
  },
      {
        path: 'view/:id',
        component: EstadoCivilFormComponent
      }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    EstadoCivilListComponent,
    EstadoCivilFormComponent
  ]
})
export class EstadoCivilModule { }
