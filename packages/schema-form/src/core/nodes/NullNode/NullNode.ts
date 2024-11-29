import type { NullSchema, NullValue } from '@lumy/schema-form/types';

import { BaseNode } from '../BaseNode';
import { MethodType, type SchemaNodeConstructorProps } from '../type';

export class NullNode extends BaseNode<NullSchema, NullValue> {
  #value: NullValue | undefined;
  get value() {
    return this.#value;
  }
  set value(input: NullValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: NullValue | undefined) {
    this.#emitChange(input);
  }
  parseValue(input: NullValue | undefined) {
    return input;
  }
  #emitChange(input: NullValue | undefined) {
    const previous = this.#value;
    const current = this.parseValue(input);
    if (previous !== current) {
      this.#value = current;
      this.onChange(current);
      this.publish({
        type: MethodType.Change,
        payload: current,
        options: {
          previous,
          current,
        },
      });
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
  }: SchemaNodeConstructorProps<NullSchema>) {
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });
    if (this.defaultValue !== undefined) this.setValue(this.defaultValue);
  }
}
