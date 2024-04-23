import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ChartData, ChartFormData } from './chart.type';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly httpClient = inject(HttpClient);
  private graphs: ChartData[] = [];
  private graphs$ = new BehaviorSubject<ChartData[]>(this.graphs);
  public graphsData: Observable<ChartData[]> = this.graphs$.asObservable();
  private apiUrl = 'http://localhost:5000/api';

  private addGraph(graph: ChartData) {
    if (!graph.points.length) {
      return;
    }
    this.graphs.push(graph);
    this.graphs$.next(this.graphs);
  }

  public getGraphData(formData: ChartFormData): Observable<ChartData>
  {
    return this.httpClient.post<number[]>(`${this.apiUrl}/${formData.db}`, formData).pipe(
      map((times) => {
        return {
          title: `${formData.db} ${formData.level} ${formData.type}`,
          points: times.map((time) => ({ y: time }))
        }
      }),
      tap(this.addGraph.bind(this))
    )
  }
}
