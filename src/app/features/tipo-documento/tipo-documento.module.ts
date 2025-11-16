import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoDocumentoListComponent } from './tipo-documento-list/tipo-documento-list.component';
import { TipoDocumentoFormComponent } from './tipo-documento-form/tipo-documento-form.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: TipoDocumentoListComponent
  },
  {
    path: 'create',
    component: TipoDocumentoFormComponent
  },
  {
    path: 'edit/:id',
    component: TipoDocumentoFormComponent
  },
      {
        path: 'view/:id',
        component: TipoDocumentoFormComponent
      }
];

@NgModule({
  imports: [CommonModule,
    RouterModule.forChild(routes),
    TipoDocumentoListComponent,
    TipoDocumentoFormComponent],

})
export class TipoDocumentoModule { }
