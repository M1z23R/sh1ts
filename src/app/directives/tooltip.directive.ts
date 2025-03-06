import {
  Directive,
  ElementRef,
  ViewContainerRef,
  input,
  HostListener,
  ComponentRef,
  signal,
} from '@angular/core';
import { TooltipComponent } from '../components/tooltip/tooltip.component';

@Directive({
  selector: '[tooltip]',
  standalone: true,
})
export class TooltipDirective {
  tooltipDisabled = input<boolean>(false);
  content = input.required<string>();
  position = input<TooltipPosition>('top');
  tooltipRef = signal<ComponentRef<TooltipComponent> | null>(null);

  constructor(
    private ref: ElementRef<HTMLElement>,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngAfterViewInit() {
    if (this.tooltipDisabled()) {
      return;
    }
    const tooltipRef = this.viewContainerRef.createComponent(TooltipComponent);

    tooltipRef.instance.content.set(this.content());
    tooltipRef.instance.placement.set(this.position());
    tooltipRef.instance.parentRefRect.set(
      this.ref.nativeElement.getBoundingClientRect(),
    );

    this.tooltipRef.set(tooltipRef);
  }

  @HostListener('mousemove') onMouseEnter() {
    this.tooltipRef()?.instance.show();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.tooltipRef()?.instance.hide();
  }
}

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
