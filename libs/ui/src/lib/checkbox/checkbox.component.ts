import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'mlsk-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CheckboxComponent,
    multi: true
  }]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() value: boolean;
  @Input() empty: boolean;
  @Input() withoutPlus: boolean;

  onChange: any = () => {};
  onTouch: any = () => {};

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  onClick(): void {
    this.onTouch();
    this.value = !this.value;
    this.onChange(this.value);
  }
}
