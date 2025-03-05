import { Component, model } from '@angular/core';
import { WorksheetComponent } from '../worksheet/worksheet.component';
import { WorkSheet } from 'xlsx';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tab-control',
  imports: [NgClass, WorksheetComponent],
  templateUrl: './tab-control.component.html',
  styleUrl: './tab-control.component.css',
})
export class TabControlComponent {
  tabs = model.required<TabControlTab[]>();

  onChangeTab(tab: TabControlTab) {
    this.tabs.update((c) =>
      [...c].map((item) => {
        return { ...item, active: item === tab };
      }),
    );
  }
}

export interface TabControlTab {
  label: string;
  worksheet: WorkSheet;
  active: boolean;
}
