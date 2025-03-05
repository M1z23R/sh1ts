import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement): void {
    const isAnchor = target.tagName === "A"
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside || isAnchor) {
      this.clickOutside.emit();
    }
  }
}

