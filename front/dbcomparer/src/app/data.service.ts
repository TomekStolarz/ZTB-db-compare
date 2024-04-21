import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartData, ChartFormData } from './chart.type';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly httpClient = inject(HttpClient);
  private graphs: ChartData[] = [];
  private graphs$ = new BehaviorSubject<ChartData[]>(this.graphs);
  public graphsData: Observable<ChartData[]> = this.graphs$.asObservable();

  public addGraph(formData: ChartFormData) {
    const graph = this.getGraphData(formData);
    this.graphs.push(graph);
    this.graphs$.next(this.graphs);
  }

  private getGraphData(formData: ChartFormData): ChartData
   {
    return {
      title: `${formData.db} ${formData.level} ${formData.type}`,
      points: [{y: 1}, {y: 3}, {y: 6}]
    }
  }
}
