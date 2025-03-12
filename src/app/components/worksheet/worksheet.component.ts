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
  imports: [VirtualTableComponent, VirtualScrollComponent],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.css',
})
export class WorksheetComponent {
  worksheetService = inject(WorksheetService);
  @ViewChild('tableContainer') tableContainer!: ElementRef;

  tableHeight$ = signal(0);
  private resizeObserver!: ResizeObserver;

  file = signal<File | null>(null);
  worksheet = input.required<WorkSheet>();
  items = signal<WorksheetRow[]>([]);
  total = signal<number>(0);
  perPage = computed(() => Math.floor(this.tableHeight$() / 32));
  index = signal<number>(0);

  onWheelScroll(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const isPositive = (e as any).wheelDeltaY > 0;
    const newIndex = Math.min(
      this.total(),
      Math.max(0, this.index() + (isPositive ? -1 : 1) * this.perPage()),
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
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        console.log(entry.contentRect.height);
        this.tableHeight$.set(Math.round(entry.contentRect.height));
        this.onIndexChange(this.index());
      }
    });

    if (this.tableContainer) {
      this.resizeObserver.observe(this.tableContainer.nativeElement);
    }

    this.destroyRef.onDestroy(() => {
      this.resizeObserver.disconnect();
    });
  }
}
