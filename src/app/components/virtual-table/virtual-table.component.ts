import {
  Component,
  effect,
  HostListener,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorksheetCell, WorksheetRow } from '../../services/worksheet.service';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

@Component({
  selector: 'app-virtual-table',
  imports: [AutoFocusDirective, FormsModule],
  templateUrl: './virtual-table.component.html',
  styleUrl: './virtual-table.component.css',
})
export class VirtualTableComponent {
  constructor() {
    effect(() => {
      const startCell = this.startCell();
      const endCell = this.endCell();
      if (!startCell || !endCell) {
        return;
      }

      if (this.isSelecting()) {
        const startRow = Math.min(startCell.row, endCell.row);
        const endRow = Math.max(startCell.row, endCell.row);
        const startCol = Math.min(startCell.col, endCell.col);
        const endCol = Math.max(startCell.col, endCell.col);

        this.rows.update((curr) => [
          ...curr.map((row) => ({
            ...row,
            cells: row.cells.map((cell) => ({
              ...cell,
              selected:
                (startRow == 0 ||
                  (cell.row >= startRow && cell.row <= endRow)) &&
                (startCol == 0 || (cell.col >= startCol && cell.col <= endCol)),
            })),
          })),
        ]);
      }
    });
  }

  rows = model.required<WorksheetRow[]>();
  cols = input.required<string[]>();

  editing = signal<boolean>(false);
  cellInput = signal<string>('');

  cellValueChanged = output<WorksheetCell>();

  onCellInputKeyDown(cell: WorksheetCell, e: KeyboardEvent) {
    if (e.key == 'Enter') {
      this.rows.update((c) => {
        cell.value = this.cellInput();
        return [...c];
      });
      this.cellValueChanged.emit(cell);
      this.stopEditing(cell, true);
    }

    if (e.key == 'Escape') {
      this.stopEditing(cell, false);
    }
  }

  onClickOutside(cell: WorksheetCell) {
    if (!this.editing()) {
      return;
    }
    this.stopEditing(cell, true);
  }

  stopEditing(cell: WorksheetCell, save: boolean) {
    this.editing.set(false);
    this.rows.update((c) => {
      cell.editing = !cell.editing;
      if (save) {
        cell.value = this.cellInput();
      }
      return [...c];
    });
    this.cellInput.set('');
    this.cellValueChanged.emit(cell);
  }

  startEditing(cell: WorksheetCell) {
    if (this.editing()) {
      return;
    }

    this.editing.set(true);
    this.cellInput.set(cell.value);
    this.rows.update((c) => {
      cell.editing = !cell.editing;
      return [...c];
    });
  }

  isSelecting = signal(false);
  startCell = signal<{ row: number; col: number } | null>(null);
  endCell = signal<{ row: number; col: number } | null>(null);

  onMouseUp() {
    this.isSelecting.set(false);
  }

  onMouseEnter(row: number, col: number) {
    if (!this.isSelecting()) {
      return;
    }

    if (!row || !col) {
      return;
    }

    this.endCell.set(
      this.startCell()?.row == 0
        ? { row: 0, col }
        : this.startCell()?.col == 0
          ? { row, col: 0 }
          : { row, col },
    );
  }

  onMouseDown(row: number, col: number) {
    this.isSelecting.set(true);
    this.startCell.set({ row, col });
    this.endCell.set({ row, col });
  }

  @HostListener('window:keydown', ['$event'])
  onTableKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key == 'c') {
      const selectedCells = this.rows()
        .filter((x) => x.cells.some((y) => y.selected))
        .map((row) =>
          row.cells
            .filter((cell) => cell.selected)
            .map((cell) => cell.value)
            .join('\t'),
        )
        .join('\n');
      window.navigator.clipboard.writeText(selectedCells);
    }
  }
}
