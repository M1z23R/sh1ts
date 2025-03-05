import { Component, inject, input, signal } from '@angular/core';
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
  imports: [VirtualTableComponent, VirtualScrollComponent],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.css',
})
export class WorksheetComponent {
  worksheetService = inject(WorksheetService);

  file = signal<File | null>(null);
  worksheet = input.required<WorkSheet>();
  items = signal<WorksheetRow[]>([]);
  total = signal<number>(0);
  perPage = signal<number>(15);
  index = signal<number>(0);

  onWheelScroll(e: Event) {
    const isPositive = (e as any).wheelDeltaY > 0;
    const newIndex = Math.min(
      this.total(),
      Math.max(0, this.index() + (isPositive ? -15 : 15)),
    );
    this.onIndexChange(newIndex);
  }

  onIndexChange(v: number) {
    let realIndex = v;
    if (realIndex > this.total() - this.perPage()) {
      realIndex = Math.max(this.total() - this.perPage(), 0);
    }
    realIndex = Math.max(0, realIndex);

    this.index.set(realIndex);
    this.worksheetService
      .getPage(this.worksheet(), realIndex, this.perPage())
      .then((r) => {
        this.items.set(r.items);
        this.total.set(r.total);
      });
  }

  onCellValueChanged(cell: WorksheetCell) {
    const worksheet = this.worksheet();
    if (!worksheet) {
      return;
    }
    this.worksheetService.updateCell(worksheet, cell);
  }

  ngOnInit() {
    this.worksheetService
      .getPage(this.worksheet(), 0, this.perPage())
      .then((r) => {
        this.items.set(r.items);
        this.total.set(r.total);
      });
  }
}
