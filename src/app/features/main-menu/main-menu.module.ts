import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu.component';

const routes: Routes = [
  {
    path: '',
    component: MainMenuComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MainMenuComponent
  ]
})
export class MainMenuModule { }
