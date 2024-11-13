import type { StringValue } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { type ConstructorProps, MethodType } from '../type';
import { type EventOrValue, getValueFromEvent } from '../util';
import parseString from './parseString';

export class StringNode extends BaseNode {
  readonly defaultValue: StringValue | undefined;
  readonly type = 'string';

  public children = () => this._children;
  public getValue = () => this._value;
  public setValue = (value: StringValue) => this._emitChange(value);
  public parseValue = (value: StringValue | undefined) =>
    value !== undefined ? parseString(value, this.schema) : undefined;

  private _children: never[] = [];
  private _emitChange: (value: EventOrValue<StringValue | undefined>) => void;
  private _value: StringValue | undefined;

  constructor({
    key,
    name,
    schema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: ConstructorProps<StringValue>) {
    super({ key, name, schema, defaultValue, onChange, parentNode, ajv });
    this.defaultValue = defaultValue;
    this._value = this.defaultValue;

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
