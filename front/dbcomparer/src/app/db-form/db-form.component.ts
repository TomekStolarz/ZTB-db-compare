import { Component, inject } from '@angular/core';
import {  NonNullableFormBuilder, Validators } from '@angular/forms';
import { DataService } from '../data.service';

@Component({
  selector: 'app-db-form',
  templateUrl: './db-form.component.html',
  styleUrls: ['./db-form.component.scss']
})
export class DbFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dataService = inject(DataService);
  protected dbSelectData = [
    { key: 'mysql', label: 'Mysql'},
    { key: 'mongo', label: 'MongoDB'},
    { key: 'cassandra', label: 'Cassandra'},
    { key: 'postgres', label: 'Postgres'},
  ]

  protected queryType = [
    { key: 'select', label: 'SELECT'},
    { key: 'insert', label: 'INSERT'},
    { key: 'update', label: 'UPDATE'},
  ]

  protected queryLevel = [
    { key: 'easy', label: 'EASY'},
    { key: 'advanced', label: 'ADVANCED'},
  ]

  protected graphForm = this.fb.group({
    count: [0, Validators.required],
    db: [this.dbSelectData[0].key, Validators.required],
    type: [this.queryType[0].key, Validators.required],
    level: [this.queryLevel[0].key, Validators.required],
  })

  protected onAddCLick(): void {
    if (this.graphForm.invalid) {
      return;
    }
    this.dataService.getGraphData(this.graphForm.getRawValue()).subscribe();
  }
}
