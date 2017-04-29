import {
  Component,
  OnInit,
  Input,
  ContentChildren,
  QueryList,
  forwardRef,
  ElementRef,
  HostListener,
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { FrOptionComponent } from './option.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface IFrDropDownOption {
  value: any;
  label: string | number;
}

const noop = () => {};

export const SELECT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FrSelectComponent),
  multi: true
};

@Component({
  selector: 'fr-select',
  templateUrl: './select.component.html',
  providers: [SELECT_CONTROL_VALUE_ACCESSOR],
  animations: [
    trigger('labelState', [
      state('placeholder', style({
        top: '5px',
        left: '0',
        color: '#CCCCCC'
      })),
      state('label', style({
        top: '-10px',
        left: '0px',
        color: '#CCCCCC',
        'font-size': '12px'
      })),
      state('labelOnFocus', style({
        top: '-10px',
        left: '0px',
        color: '#D33682',
        'font-size': '12px'
      })),
      transition('* => *', [
        animate('200ms ease-out')
      ])
    ]),
    trigger('listState', [
      state('hidden', style({
        opacity: 0,
        transform: 'scaleY(0)'
      })),
      state('show', style({
        opacity: 1,
        transform: 'scaleY(1)'
      })),
      transition('* => *', [
        animate('200ms ease-out')
      ])
    ])
  ]
})
export class FrSelectComponent implements OnInit, ControlValueAccessor {
  @Input() name: string;
  @Input() placeholder: string | number;
  @Input() browserNative: boolean;

  @ContentChildren(FrOptionComponent) _options: QueryList<FrOptionComponent> = new QueryList<FrOptionComponent>();

  private _innerValue: any;
  private _onChangeCallback: (_: any) => void = noop;
  private _onTouchedCallback: () => void = noop;
  private _isDisabled = false;

  public optionsVisibility: string = 'hidden';
  public label: string | number;
  public labelState: string = 'placeholder';

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.optionsVisibility = 'hidden';
  }

  public onChange(value): void {
    this.value      = value;
    this.labelState = 'label';
  }

  get value(): any {
    return this._innerValue;
  }

  set value(obj: any) {
    if (obj !== this._innerValue) {
      this._innerValue = obj;
      this._onChangeCallback(obj);
    }
  }

  get disabled(): boolean {
    return this._isDisabled;
  }

  set disabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (obj !== this._innerValue) {
      this._innerValue = obj;
    }
    this._options.forEach((option) => {
      if (option.value === obj) {
        this.label = option.label;
        this.onBlur();
      }
    });
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }

  setDisableState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
  }

  public toggleOptionsVisiblity(): void {
    this.optionsVisibility = (this.optionsVisibility === 'show') ? 'hidden': 'show';
    this.onFocus();
  }

  public select(option) {
    this.value             = option.value;
    this.label             = option.label;
    this.optionsVisibility = 'hidden';
    this.labelState        = 'label';
  }

  public isSelected(value) {
    return this.value === value;
  }

  @HostListener('document:click', ['$event'])
  disappear(event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.optionsVisibility = 'hidden';
      this.onBlur();
    }
  }

  public onFocus() {
    this.labelState = 'labelOnFocus';
  }

  public onBlur() {
    if (this.value === null || this.value === undefined || this.value === '') {
      this.labelState = 'placeholder';
      return;
    }
    this.labelState        = 'label';
    this.optionsVisibility = 'hidden';
  }
}
