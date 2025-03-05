import { Component, computed, inject, signal } from '@angular/core';
import { WorksheetRow, WorksheetService } from './services/worksheet.service';
import { WorkBook, WorkSheet } from 'xlsx';
import { WorksheetComponent } from './components/worksheet/worksheet.component';
import {
  TabControlComponent,
  TabControlTab,
} from './components/tab-control/tab-control.component';

@Component({
  selector: 'app-root',
  imports: [WorksheetComponent, TabControlComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  worksheetService = inject(WorksheetService);
  workbook = signal<WorkBook | null>(null);

  tabs = signal<TabControlTab[]>([]);
  worksheets = computed(() => {
    const workbook = this.workbook();
    if (!workbook) {
      return [];
    }
    const worksheets = workbook.Sheets;
    return Object.keys(worksheets).map((worksheet) => {
      return { id: worksheet, worksheet: worksheets[worksheet] };
    });
  });
  selectedWorksheet = signal<WorkSheet | null>(null);

  file = signal<File | null>(null);
  items = signal<WorksheetRow[]>([]);
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
    this.worksheetService.getWorkbook(file).then((workbook) => {
      this.workbook.set(workbook);
      this.tabs.set(
        Object.keys(workbook.Sheets).map((x, i) => {
          return { active: i === 0, label: x, worksheet: workbook.Sheets[x] };
        }),
      );
      this.selectedWorksheet.set(Object.values(workbook.Sheets)[0]);
    });
  }

  onChangeWorksheet(worksheet: WorkSheet) {
    this.selectedWorksheet.set(worksheet);
  }

  onExport() {
    const workbook = this.workbook();
    if (!workbook) {
      return;
    }
    this.worksheetService.exportWorkbook(workbook);
  }
}
