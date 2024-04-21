import { Component, Input, inject } from '@angular/core';
import { ChartData } from '../chart.type';
import { Observable, map } from 'rxjs';
import { DataService } from '../data.service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent { 
  protected graphsData: Observable<any[]> = inject(DataService).graphsData.pipe(map((value) => {
    return value.map((data) => ({
      zoomEnabled: true,
      exportEnabled: true,
      theme: "light2",
      title: {text: data.title},
      data: [{
        type: 'line',
        dataPoints: data.points
      }]
    }));
  }));
}
