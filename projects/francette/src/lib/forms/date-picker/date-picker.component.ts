import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  NgZone,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export class FrDatePickerChange {
  source: FrDatePickerComponent;
  value: any;
}

const noop = () => {};

const SUNDAY   = 0;
const SATURDAY = 6;
const DATE_MAX = 31;
const WEEK_DATE_COUNT = 7;

const HIDDEN = 'hidden';
const SHOW   = 'show';

export const DATE_PICKER_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FrDatePickerComponent),
  multi: true
};

@Component({
  selector: 'fr-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [DATE_PICKER_CONTROL_VALUE_ACCESSOR],
  animations: [
    trigger('calendarVisibility', [
      state(HIDDEN, style({
        opacity: 0,
        transform: 'translateY(-5%)',
        'pointer-events': 'none'
      })),
      state(SHOW, style({
        opacity: 1
      })),
      transition(`${HIDDEN} => ${SHOW}`, [
        animate('200ms ease-out')
      ]),
      transition(`${SHOW} => ${HIDDEN}`, [
        animate('200ms 200ms ease-out')
      ])
    ])
  ]
})
export class FrDatePickerComponent implements OnInit, ControlValueAccessor {

  @Input() name: string;

  @Output() change: EventEmitter<FrDatePickerChange> = new EventEmitter<FrDatePickerChange>();

  @HostBinding('class.fr-date-picker-host') datePickerHost = true;

  private _innerValue: any;
  private _onChangeCallback: (_: any) => void = noop;
  private _onTouchedCallback: () => void = noop;
  private _isDisabled = false;

  public calendarVisibility: string;
  public target: Date;
  public weeks: Date[][];
  private _oldValue: Date;
  private _selectOutOfMonth: boolean;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
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

  writeValue(obj: any): void {
    if (obj !== this._innerValue) {
      this._innerValue = obj;
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.calendarVisibility = HIDDEN;
    this._isDisabled = isDisabled;
  }

  get disabled() {
    return this._isDisabled;
  }

  set disabled(isDisabled) {
    this._isDisabled = isDisabled;
  }


  ngOnInit() {
    this.calendarVisibility = HIDDEN;
    this.target             = new Date();
    this._resetCalendar(this.target);

    this.ngZone.runOutsideAngular(() => this.disapperOnClick());
    this.ngZone.runOutsideAngular(() => this.disapperOnKeyDown());
  }

  private _resetCalendar(target: Date): void {
    this.weeks  = [];

    const first: Date = new Date(target.getFullYear(), target.getMonth(), 1);
    let week: Array<Date> = [];

    // A month before target month
    for (let i = -(first.getDay() - 1); i <= 0; ++i) {
      const d: Date = new Date(target.getFullYear(), target.getMonth(), i);
      week.push(d);
    }

    // target month
    for (let i = 1; i <= DATE_MAX; ++i) {
      const d: Date = new Date(target.getFullYear(), target.getMonth(), i);
      if (d.getMonth() !== target.getMonth()) {
        break;
      }
      week.push(d);
      if (d.getDay() === SATURDAY) {
        this.weeks.push(week);
        week = [];
      }
    }

    // Next month
    for (let i = 1; week.length < WEEK_DATE_COUNT; ++i) {
      week.push(new Date(target.getFullYear(), target.getMonth() + 1, i));
    }
    this.weeks.push(week);
  }

  public move(diff: number): void {
    this.target = new Date(this.target.getFullYear(), this.target.getMonth() + diff, 1);
    this._resetCalendar(this.target);
  }

  public toggleCalendarVisibility(): void {
    if (this.disabled) {
      return;
    }
    this._oldValue = new Date(this._innerValue.getTime());
    // this.calendarVisibility = !this.calendarVisibility;
    this.calendarVisibility = (this.calendarVisibility === HIDDEN) ? SHOW : HIDDEN;
  }

  public isToday(d: Date): boolean {
    if (d === null) {
      return false;
    }
    const today = new Date();
    return (d.getFullYear() === today.getFullYear()
            && d.getMonth() === today.getMonth()
            && d.getDate() === today.getDate());
  }

  private toObjectDate(d: Date): string {
    return '';
  }

  public isSelected(d: Date): boolean {
    if (this._innerValue === undefined || this._innerValue === '' || this._innerValue === null || d === null) {
      return false;
    }
    return this._innerValue.toDateString() === d.toDateString();
  }

  public changeDate(d: Date): void {
    if (d === null) {
      return;
    }
    this.value = d;
    this.emitChange();
    if (d.getMonth() !== this.target.getMonth()) {
      this.target = d;
      this._resetCalendar(d);
      this._selectOutOfMonth = true;
    }
  }

  public isOutOfMonth(d: Date): boolean {
    return (d.getFullYear() !== this.target.getFullYear()
            || d.getMonth() !== this.target.getMonth());
  }

  public cancel(): void {
    this.value = this._oldValue;
    this.calendarVisibility = HIDDEN;
  }

  public commit(): void {
    this.calendarVisibility = HIDDEN;
  }

  public disapperOnClick() {
    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      // Without this condition, calendar disappear
      // when select previous or next month date.
      if (this._selectOutOfMonth) {
        this.ngZone.run(() => {
          this._selectOutOfMonth = false;
          this._onTouchedCallback();
        });
        return;
      }

      if (!this.el.nativeElement.contains(event.target) && this.calendarVisibility !== HIDDEN) {
        this.ngZone.run(() => {
          this.calendarVisibility = HIDDEN;
          this._onTouchedCallback();
        });
      }
    });
  }

  public disapperOnKeyDown() {
    this.renderer.listen('window', 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.ngZone.run(() => {
          this.calendarVisibility = HIDDEN;
          this._onTouchedCallback();
        });
      }
    });
  }

  private emitChange(): void {
    const event = new FrDatePickerChange();
    event.source = this;
    event.value  = this.value;
    this.change.emit(event);
  }
}
