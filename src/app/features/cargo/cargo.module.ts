import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CargoListComponent } from './cargo-list/cargo-list.component';
import { CargoFormComponent } from './cargo-form/cargo-form.component';

const routes: Routes = [
  {
    path: '',
    component: CargoListComponent
  },
  {
    path: 'create',
    component: CargoFormComponent
  },
  {
    path: 'edit/:id',
    component: CargoFormComponent
  },
  {
    path: 'view/:id',
    component: CargoFormComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CargoListComponent,
    CargoFormComponent
  ]
})
export class CargoModule { }