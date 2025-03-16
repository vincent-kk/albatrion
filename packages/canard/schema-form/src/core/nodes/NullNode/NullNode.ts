import type { NullSchema, NullValue } from '@/schema-form/types';

import { BaseNode } from '../BaseNode';
import { NodeMethod, type SchemaNodeConstructorProps } from '../type';

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
        type: NodeMethod.Change,
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
    validationMode,
    ajv,
  }: SchemaNodeConstructorProps<NullSchema>) {
    super({
      key,
      name,
      jsonSchema,
      defaultValue,
      onChange,
      parentNode,
      validationMode,
      ajv,
    });
    if (this.defaultValue !== undefined) this.setValue(this.defaultValue);
  }
}
