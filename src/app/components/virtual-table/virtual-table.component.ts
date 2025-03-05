import { Component, input } from '@angular/core';

@Component({
  selector: 'app-virtual-table',
  imports: [],
  templateUrl: './virtual-table.component.html',
  styleUrl: './virtual-table.component.css',
})
export class VirtualTableComponent {
  index = input.required<number>()
  rows = input.required<string[][]>()
  percentage = input.required<number>();
}
