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

  getPage = async (
    file: File,
    start: number = 0,
    limit: number = 15,
  ): Promise<{ items: string[][]; total: number }> => {
    try {
      const workbook = xlsx.read(await file.arrayBuffer());
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const range = this.getWorksheetRange(worksheet);

      let realStart = 1 + start;
      if (realStart > range.rows - limit) {
        realStart = range.rows - limit;
      }
      realStart = Math.max(0, realStart);

      const items: string[][] = [];
      for (let i = realStart; i <= range.rows && items.length < limit; i++) {
        const row: string[] = [];
        for (let j = 1; j <= range.cols; j++) {
          const cell = this.getSafeValueFromCell(
            `${this.columnToLetter(j)}${i}`,
            worksheet,
          );
          row.push(cell);
        }
        items.push(row);
      }

      return { items, total: range.rows };
    } catch (error) {
      console.error(error);
      return { items: [], total: 0 };
    }
  };
}

export interface WorksheetRange {
  rows: number;
  cols: number;
}
