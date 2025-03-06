import {
  Component,
  EventEmitter,
  input,
  model,
  Output,
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
  index = input.required<number>();
  rows = model.required<WorksheetRow[]>();

  editing = signal<boolean>(false);
  cellInput = signal<string>('');

  @Output() cellValueChanged = new EventEmitter<WorksheetCell>();

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

  selectRow(row: WorksheetRow, e: MouseEvent) {
    this.rows.update((c) => {
      return c.map((x) => {
        return {
          ...x,
          cells: x.cells.map((y) => {
            return { ...y, selected: x === row || (y.selected && e.ctrlKey) };
          }),
        };
      });
    });
  }

  selectCell(cell: WorksheetCell, e: MouseEvent) {
    e.stopPropagation();
    this.rows.update((rows) => {
      return rows.map((row) => {
        return {
          index: row.index,
          cells: row.cells.map((currentCell) => {
            return {
              ...currentCell,
              selected:
                (currentCell.selected && e.ctrlKey) || currentCell === cell,
            };
          }),
        };
      });
    });
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
}
