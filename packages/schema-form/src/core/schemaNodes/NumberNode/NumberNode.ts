import type { NumberValue } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { type ConstructorProps, MethodType } from '../type';
import { type EventOrValue, getValueFromEvent } from '../util';
import parseNumber from './parseNumber';

export class NumberNode extends BaseNode {
  readonly defaultValue: NumberValue | undefined;

  readonly type = 'number';

  private _children: never[] = [];
  private _value: NumberValue | undefined;
  private _emitChange: (value: EventOrValue<NumberValue | undefined>) => void;

  public children = () => this._children;
  public getValue = () => this._value;
  public setValue = (value: NumberValue) => this._emitChange(value);
  public parseValue = (value: NumberValue | undefined) =>
    value !== undefined
      ? parseNumber(value, this.schema.type === 'integer')
      : undefined;

  constructor({
    key,
    name,
    schema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: ConstructorProps<NumberValue>) {
    super({ key, name, schema, defaultValue, onChange, parentNode, ajv });
    this.defaultValue = defaultValue;
    this._value = defaultValue;

    this._emitChange = (eventOrValue) => {
      const value = this.parseValue(getValueFromEvent(eventOrValue));
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
