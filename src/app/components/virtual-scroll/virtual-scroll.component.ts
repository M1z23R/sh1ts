import {
  Component,
  computed,
  ElementRef,
  HostListener,
  model,
  signal,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-virtual-scroll',
  imports: [],
  templateUrl: './virtual-scroll.component.html',
  styleUrl: './virtual-scroll.component.css',
})
export class VirtualScrollComponent {
  @ViewChild('container', { static: true }) container!: ElementRef;
  @ViewChild('box', { static: true }) box!: ElementRef;
  percentage = model<number>(0);

  itemsPerPage = model(1);
  totalItems = model(1);

  boxHeight = computed(() => {
    const containerHeight = this.container?.nativeElement.clientHeight || 1;
    return Math.max(
      (this.itemsPerPage() / this.totalItems()) * containerHeight,
      40,
    );
  });

  isDragging = signal(false);
  startY = signal(0);
  boxPosition = signal(0);

  calculatePercentage() {
    const containerHeight = this.container?.nativeElement.clientHeight || 1;
    const maxPosition = containerHeight - this.boxHeight();
    return Math.max(0, Math.min(100, (this.boxPosition() / maxPosition) * 100));
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging()) {
      const containerHeight = this.container.nativeElement.clientHeight;
      const boxHeight = this.box.nativeElement.clientHeight;

      const maxPosition = containerHeight - boxHeight;
      let newPosition = event.clientY - this.startY();
      newPosition = Math.max(0, Math.min(maxPosition, newPosition));

      this.boxPosition.set(newPosition);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging.set(false);
    this.percentage.set(this.calculatePercentage());
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging.set(true);
    this.startY.set(event.clientY - this.boxPosition());
  }
}
