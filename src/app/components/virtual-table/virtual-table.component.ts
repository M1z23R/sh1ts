import { Component, EventEmitter, input, model, Output, signal } from '@angular/core';
import { FormsModule } from "@angular/forms"
import { WorksheetCell, WorksheetRow } from '../../services/worksheet.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-virtual-table',
  imports: [ClickOutsideDirective, FormsModule],
  templateUrl: './virtual-table.component.html',
  styleUrl: './virtual-table.component.css',
})
export class VirtualTableComponent {
  index = input.required<number>()
  rows = model.required<WorksheetRow[]>()

  editing = signal<boolean>(false);
  cellInput = signal<string>("")

  @Output() cellValueChanged = new EventEmitter<WorksheetCell>()

  onCellInputKeyDown(cell: WorksheetCell, e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.rows.update(c => {
        cell.value = this.cellInput();
        return [...c]
      })
      this.cellValueChanged.emit(cell)
      this.stopEditing(cell, true);
    }

    if (e.key == "Escape") {
      this.stopEditing(cell, false);
    }
  }

  onClickOutside(cell: WorksheetCell) {
    if (!this.editing()) { return }
    const shouldSave = confirm("Save changes?");
    this.cellValueChanged.emit(cell)
    this.stopEditing(cell, shouldSave);
  }

  stopEditing(cell: WorksheetCell, save: boolean) {
    this.editing.set(false);
    this.rows.update(c => {
      cell.editing = !cell.editing
      if (save) {
        cell.value = this.cellInput()
      }
      return [...c]
    })
    this.cellInput.set("");

  }

  startEditing(cell: WorksheetCell) {
    if (this.editing()) {
      return;
    }

    this.editing.set(true);
    this.cellInput.set(cell.value);
    this.rows.update(c => {
      cell.editing = !cell.editing
      return [...c]
    })
  }
}
