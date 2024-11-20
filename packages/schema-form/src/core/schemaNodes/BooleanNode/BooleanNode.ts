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
  protected applyValue(input: BooleanValue | undefined) {
    this.#emitChange(input);
  }
  parseValue(input: BooleanValue | undefined) {
    return parseBoolean(input);
  }

  #emitChange(input: BooleanValue | undefined) {
    const value = this.parseValue(input);
    if (this.#value !== value) {
      this.#value = value;
      this.onChange(value);
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
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });

    if (defaultValue !== undefined) {
      this.setValue(defaultValue);
    }

    if (defaultValue === undefined && jsonSchema.default !== undefined) {
      this.setDefaultValue(this.parseValue(jsonSchema.default));
      this.#emitChange(this.defaultValue);
    }
  }
}
