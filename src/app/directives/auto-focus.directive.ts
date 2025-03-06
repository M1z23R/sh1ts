import { Directive, ElementRef } from '@angular/core';
@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocusDirective {
  constructor(private el: ElementRef) { }
  ngAfterViewInit(): void {
    this.focusElement();
  }
  private focusElement(): void {
    if (
      this.el.nativeElement &&
      typeof this.el.nativeElement.focus === 'function'
    ) {
      setTimeout(() => this.el.nativeElement.focus(), 0);
    }
  }
}
