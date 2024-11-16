import type { BooleanSchema, BooleanValue } from '@lumy/schema-form/types';

import { parseBoolean } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { MethodType, type SchemaNodeConstructorProps } from '../type';

export class BooleanNode extends BaseNode<BooleanSchema, BooleanValue> {
  #value: BooleanValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: BooleanValue | undefined) {
    this.setValue(input);
  }
  setValue(
    input:
      | BooleanValue
      | undefined
      | ((prev: BooleanValue | undefined) => BooleanValue | undefined),
  ) {
    const inputValue = typeof input === 'function' ? input(this.#value) : input;
    this.#emitChange(inputValue);
  }
  parseValue(input: BooleanValue | undefined) {
    return parseBoolean(input);
  }

  #onChange: SetStateFn<BooleanValue | undefined>;

  #emitChange(input: BooleanValue | undefined) {
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
  }: SchemaNodeConstructorProps<BooleanSchema>) {
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
