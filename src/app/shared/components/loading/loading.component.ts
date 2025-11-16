import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { loading$ } from '../../../core/interceptors/loading.interceptor';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  isLoading = false;

  ngOnInit(): void {
    loading$.subscribe(
      (isLoading: boolean) => this.isLoading = isLoading
    );
  }
}