import { Component, inject, signal } from '@angular/core';
import { VirtualScrollComponent } from './components/virtual-scroll/virtual-scroll.component';
import { VirtualTableComponent } from './components/virtual-table/virtual-table.component';
import { WorksheetService } from './services/worksheet.service';

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
  items = signal<string[][]>([]);
  total = signal<number>(0);
  perPage = signal<number>(15);
  index = signal<number>(0);

  onFileChange(e: Event) {
    const el = e.target as HTMLInputElement;
    const file = el.files?.[0];

    if (!file) {
      this.file.set(null);
      return;
    }

    this.file.set(file);
    this.worksheetService.getPage(file, 0, 15).then((r) => {
      this.items.set(r.items);
      this.total.set(r.total);
    });
  }

  onPercentageChange(v: number) {
    this.percentage.set(v);

    const file = this.file();
    if (!file) {
      return;
    }

    const currentIndex = Math.round((this.total() * v) / 100);
    this.index.set(currentIndex);
    this.worksheetService
      .getPage(file, currentIndex, this.perPage())
      .then((r) => {
        this.items.set(r.items);
        this.total.set(r.total);
      });
  }
}
