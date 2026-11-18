import { Component, Input, Self, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

let nextId = 0;

@Component({
  selector: 'app-text-input',
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss'
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  /** Optional Material icon name shown inside the field. */
  @Input() icon = '';
  @Input() placeholder = '';
  @Input() autocomplete = '';

  readonly id = `text-input-${nextId++}`;
  showPassword = signal(false);

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}

  get control() {
    return this.controlDir.control as FormControl;
  }

  get inputType() {
    return this.type === 'password' && this.showPassword() ? 'text' : this.type;
  }

  get showError() {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }
}
