import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { FrDataTableEvent } from '../data-table/data-table.component';

export interface FrDataTableActionKey {
  key: string;
  label: string;
  extraParams?: any;
}

@Component({
  selector: 'fr-data-table-header',
  template: ''
})
export class FrDataTableHeaderComponent {

  @Output() updateAction: EventEmitter<FrDataTableEvent> = new EventEmitter<FrDataTableEvent>();
  @Output() otherAction:  EventEmitter<FrDataTableEvent> = new EventEmitter<FrDataTableEvent>();

  private _title: string;
  private _otherActionKeys: Array<FrDataTableActionKey> = [];

  @Input()
  set title(title) {
    this._title = title;
  }

  get title(): string {
    return this._title;
  }

  @Input()
  set otherActionKeys(otherActionKeys) {
    this._otherActionKeys = otherActionKeys;
  }

  get otherActionKeys(): Array<FrDataTableActionKey> {
    return this._otherActionKeys;
  }

  private _actionKeys: Array<FrDataTableActionKey> = [];
  @Input()
  set actionKeys(actionKeys: Array<FrDataTableActionKey>) {
    this._actionKeys = actionKeys;
  }

  get actionKeys(): Array<FrDataTableActionKey> {
    if (this._otherActionKeys.length) {
      return this._otherActionKeys;
    }
    return this._actionKeys;
  }

}