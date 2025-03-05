import { Injectable } from '@angular/core';
import * as xlsx from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class WorksheetService {
  getWorksheetRange = (worksheet: xlsx.WorkSheet): WorksheetRange => {
    if (worksheet['!ref']) {
      const parts = xlsx.utils.decode_range(worksheet['!ref']);
      const numCols = parts.e.c - parts.s.c + 1;
      const numRows = parts.e.r - parts.s.r + 1;
      return { rows: numRows, cols: numCols };
    }
    return { rows: 0, cols: 0 };
  };

  columnToLetter = (column: number): string => {
    let temp,
      letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  };

  getSafeValueFromCell = (cell: string, worksheet: xlsx.WorkSheet): string => {
    return worksheet[cell] ? worksheet[cell].v : '';
  };

  updateCell = async (worksheet: xlsx.WorkSheet, cell: WorksheetCell) => {
    const original = worksheet[cell.position];
    worksheet[cell.position] = { ...original, v: cell.value };
  };

  getWorkbook = async (file: File): Promise<xlsx.WorkBook> => {
    const workbook = xlsx.read(await file.arrayBuffer());
    return workbook;
  };

  getInitial = async (
    file: File,
  ): Promise<{
    worksheet: xlsx.WorkSheet | null;
    items: WorksheetRow[];
    total: number;
  }> => {
    try {
      const workbook = xlsx.read(await file.arrayBuffer());
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const range = this.getWorksheetRange(worksheet);

      const items: WorksheetRow[] = [];
      for (let i = 1; i <= range.rows && items.length < 15; i++) {
        const row: WorksheetRow = { cells: [] };
        for (let j = 1; j <= range.cols; j++) {
          const value = this.getSafeValueFromCell(
            `${this.columnToLetter(j)}${i}`,
            worksheet,
          );
          const cell: WorksheetCell = {
            value,
            editing: false,
            position: `${this.columnToLetter(j)}${i}`,
          };
          row.cells.push(cell);
        }

        items.push(row);
      }

      return { worksheet, items, total: range.rows };
    } catch (error) {
      console.error(error);
      return { items: [], total: 0, worksheet: null };
    }
  };

  getPage = async (
    worksheet: xlsx.WorkSheet,
    start: number = 0,
    limit: number = 15,
  ): Promise<{ items: WorksheetRow[]; total: number }> => {
    try {
      const range = this.getWorksheetRange(worksheet);
      const items: WorksheetRow[] = [];
      for (let i = start + 1; i <= range.rows && items.length < limit; i++) {
        const row: WorksheetRow = { cells: [] };
        for (let j = 1; j <= range.cols; j++) {
          const value = this.getSafeValueFromCell(
            `${this.columnToLetter(j)}${i}`,
            worksheet,
          );
          const cell: WorksheetCell = {
            value,
            editing: false,
            position: `${this.columnToLetter(j)}${i}`,
          };
          row.cells.push(cell);
        }

        items.push(row);
      }

      return { items, total: range.rows };
    } catch (error) {
      console.error(error);
      return { items: [], total: 0 };
    }
  };

  exportWorkbook = async (
    workbook: xlsx.WorkBook,
    fileName: string = 'sh1t.xlsx',
  ) => {
    const filePicker = (window as any).showSaveFilePicker;

    const xlsxBlob = new Blob(
      [xlsx.write(workbook, { bookType: 'xlsx', type: 'array' })],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    );
    if (filePicker) {
      try {
        const handle = await filePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'Spreadsheet Files',
              accept: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                  ['.xlsx'],
              },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(xlsxBlob);
        await writable.close();
        console.log('File saved successfully!');
      } catch (err) {
        console.error('Save canceled or failed:', err);
      }
    } else {
      this.downloadFileFallback(xlsxBlob, fileName);
    }
    xlsx.writeFileXLSX(workbook, fileName);
  };

  private downloadFileFallback(blob: Blob, fileName: string) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export interface WorksheetRow {
  cells: WorksheetCell[];
}

export interface WorksheetCell {
  value: string;
  position: string; //A1, B2, etc
  editing: boolean;
}

export interface WorksheetRange {
  rows: number;
  cols: number;
}
