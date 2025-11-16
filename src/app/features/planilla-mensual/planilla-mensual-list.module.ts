import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PlanillaMensualComponent } from './planilla-mensual-list/planilla-mensual-list.component';
import { BoletaModalComponent } from '../boleta-modal/boleta-modal.component';
import { PlanillaMensualService } from '../../core/services/planilla-mensual.service';


const routes: Routes = [
  {
    path: '',
    component: PlanillaMensualComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
        PlanillaMensualComponent,
    BoletaModalComponent
  ],
  providers: [
    PlanillaMensualService
  ]
})
export class PlanillaMensualModule { }