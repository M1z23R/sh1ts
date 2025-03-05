import { Component, inject, signal } from '@angular/core';
import { VirtualScrollComponent } from './components/virtual-scroll/virtual-scroll.component';
import { VirtualTableComponent } from './components/virtual-table/virtual-table.component';
import { WorksheetCell, WorksheetRow, WorksheetService } from './services/worksheet.service';
import { WorkSheet } from 'xlsx';

@Component({
  selector: 'app-root',
  imports: [VirtualScrollComponent, VirtualTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  worksheetService = inject(WorksheetService);

  percentage = signal<number>(0);
  file = signal<File | null>(null);
  worksheet = signal<WorkSheet | null>(null)
  items = signal<WorksheetRow[]>([]);
  total = signal<number>(0);
  perPage = signal<number>(15);
  index = signal<number>(0);

  onWheelScroll(e: Event) {
    this.index.update(c => c + (e as any).wheelDeltaY)
    console.log(e);
  }

  onFileChange(e: Event) {
    const el = e.target as HTMLInputElement;
    const file = el.files?.[0];

    if (!file) {
      this.file.set(null);
      return;
    }

    this.file.set(file);
    this.worksheetService.getInitial(file).then((r) => {
      this.items.set(r.items);
      this.total.set(r.total);
      this.worksheet.set(r.worksheet);
    });
  }

  onPercentageChange(v: number) {
    this.percentage.set(v);

    const worksheet = this.worksheet();
    if (!worksheet) {
      return
    }

    const currentIndex = Math.round((this.total() * v) / 100);
    this.index.set(currentIndex);

    this.worksheetService
      .getPage(worksheet, currentIndex, this.perPage())
      .then((r) => {
        this.items.set(r.items);
        this.total.set(r.total);
      });
  }

  onCellValueChanged(cell: WorksheetCell) {
    const worksheet = this.worksheet();
    if (!worksheet) { return }
    this.worksheetService.updateCell(worksheet, cell);
  }
}
