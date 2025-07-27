import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { VirtualTableComponent } from '../virtual-table/virtual-table.component';
import { VirtualScrollComponent } from '../virtual-scroll/virtual-scroll.component';
import { WorkSheet } from 'xlsx';
import {
  WorksheetCell,
  WorksheetRow,
  WorksheetService,
} from '../../services/worksheet.service';

@Component({
  selector: 'app-worksheet',
  imports: [VirtualTableComponent],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.css',
})
export class WorksheetComponent {
  worksheetService = inject(WorksheetService);

  file = signal<File | null>(null);
  worksheet = input.required<WorkSheet>();
  rows = signal<WorksheetRow[]>([]);
  cols = signal<string[]>([]);
  total = signal<number>(0);

  onCellValueChanged(cell: WorksheetCell) {
    const worksheet = this.worksheet();
    if (!worksheet) {
      return;
    }
    this.worksheetService.updateCell(worksheet, cell);
  }

  ngOnInit() {
    this.worksheetService.getItems(this.worksheet()).then((r) => {
      this.rows.set(r.items);
      this.cols.set(r.cols);
      this.total.set(r.total);
    });
  }
}
