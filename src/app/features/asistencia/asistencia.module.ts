import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsistenciaListComponent } from './asistencia-list/asistencia-list.component';

const routes: Routes = [
  {
    path: '',
    component: AsistenciaListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsistenciaModule { }
