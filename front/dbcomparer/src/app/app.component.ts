import { Component, inject } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { ChartData } from './chart.type';

@Component({
  selector: 'app-root',
  template: `<app-db-form></app-db-form>
    <app-charts></app-charts>`,
  styles: [`:host{ 
    display: flex;
  }`]
})
export class AppComponent {
  title = 'dbcomparer';
}
