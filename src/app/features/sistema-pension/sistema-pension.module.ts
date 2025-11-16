import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SistemaPensionListComponent } from './sistema-pension-list/sistema-pension-list.component';
import { SistemaPensionFormComponent } from './sistema-pension-form/sistema-pension-form.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: SistemaPensionListComponent
  },
  {
    path: 'create',
    component: SistemaPensionFormComponent
  },
  {
    path: 'edit/:id',
    component: SistemaPensionFormComponent
  },
      {
        path: 'view/:id',
        component: SistemaPensionFormComponent
      }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SistemaPensionListComponent,
    SistemaPensionFormComponent
  ]
})
export class SistemaPensionModule { }
