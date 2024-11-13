import type { BooleanValue } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { type ConstructorProps, MethodType } from '../type';
import { type EventOrBoolean, getBooleanFromEvent } from '../util';

export class BooleanNode extends BaseNode {
  readonly defaultValue: BooleanValue | undefined;

  readonly type = 'boolean';

  private _children: never[] = [];
  private _value: BooleanValue | undefined;
  private _emitChange: (value: EventOrBoolean) => void;

  public children = () => this._children;
  public getValue = () => this._value;
  public setValue = (value: BooleanValue) => this._emitChange(value);
  public parseValue = (value: BooleanValue | undefined) =>
    value !== undefined ? Boolean(value) : undefined;

  constructor({
    key,
    name,
    schema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: ConstructorProps<BooleanValue>) {
    super({ key, name, schema, defaultValue, onChange, parentNode, ajv });

    this._value = defaultValue;

    this._emitChange = (eventOrValue) => {
      const value = this.parseValue(getBooleanFromEvent(eventOrValue));
      if (this._value !== value) {
        this._value = value;
        onChange(value);
        this.publish(MethodType.Change, value);
      }
    };

    if (
      typeof defaultValue === 'undefined' &&
      typeof schema.default !== 'undefined'
    ) {
      this.defaultValue = this.parseValue(schema.default);
      this._emitChange(this.defaultValue);
    }
  }
}
