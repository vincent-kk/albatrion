import type { NumberSchema, NumberValue } from '@lumy/schema-form/types';

import { parseNumber } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { MethodType, type SchemaNodeConstructorProps } from '../type';

export class NumberNode extends BaseNode<NumberSchema, NumberValue> {
  #value: NumberValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: NumberValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: NumberValue | undefined) {
    this.#emitChange(input);
  }
  parseValue(input: NumberValue | undefined) {
    return parseNumber(input, this.jsonSchema.type === 'integer');
  }

  #onChange: SetStateFn<NumberValue | undefined>;

  #emitChange(input: NumberValue | undefined) {
    const value = this.parseValue(input);
    if (this.#value !== value) {
      this.#value = value;
      this.#onChange(value);
      this.publish(MethodType.Change, value);
    }
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: SchemaNodeConstructorProps<NumberSchema>) {
    super({ key, name, jsonSchema, defaultValue, parentNode, ajv });

    this.#onChange = onChange;

    if (defaultValue !== undefined) {
      this.setValue(defaultValue);
    }

    if (defaultValue === undefined && jsonSchema.default !== undefined) {
      this.setDefaultValue(this.parseValue(jsonSchema.default));
      this.#emitChange(this.defaultValue);
    }
  }
}
