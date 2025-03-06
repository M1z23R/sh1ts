import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { TooltipPosition } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-tooltip',
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @ViewChild('container')
  containerRef!: ElementRef<HTMLElement>;

  constructor() { }
  parentRefRect: WritableSignal<DOMRect | null> = signal(null);
  childRefRect: WritableSignal<DOMRect | null> = signal(null);

  content = signal('');
  top = signal(0);
  left = signal(0);
  placement: WritableSignal<TooltipPosition> = signal<TooltipPosition>('top');

  visible: WritableSignal<boolean> = signal(false);
  hidden: WritableSignal<boolean> = signal(true);

  show() {
    this.setPosition();
    this.hidden.set(false);
    this.visible.set(true);
    if (this.hideTimeout()) {
      clearTimeout(this.hideTimeout()!);
    }
  }

  hideTimeout: WritableSignal<any | null> = signal(null);
  hide() {
    this.visible.set(false);
    this.hideTimeout.set(setTimeout(() => this.hidden.set(true), 500));
  }

  setPosition() {
    const containerRect = this.parentRefRect()!;
    const tooltipRect =
      this.containerRef?.nativeElement.getBoundingClientRect();
    if (!tooltipRect) {
      return;
    }

    switch (this.placement()) {
      case 'top':
        this.top.set(containerRect.top - tooltipRect.height - 4);
        this.left.set(
          containerRect.left + (containerRect.width - tooltipRect.width) / 2,
        );
        break;
      case 'right':
        this.top.set(
          containerRect.top + (containerRect.height - tooltipRect.height) / 2,
        );
        this.left.set(containerRect.right + 4);
        break;
      case 'bottom':
        this.top.set(containerRect.bottom + 4);
        this.left.set(
          containerRect.left + (containerRect.width - tooltipRect.width) / 2,
        );
        break;
      case 'left':
        this.top.set(
          containerRect.top + (containerRect.height - tooltipRect.height) / 2,
        );
        this.left.set(containerRect.left - tooltipRect.width - 4);
        break;
      default:
        // Default to top placement
        this.top.set(containerRect.top - tooltipRect.height);
        this.left.set(
          containerRect.left + (containerRect.width - tooltipRect.width) / 2,
        );
        break;
    }
  }
}
