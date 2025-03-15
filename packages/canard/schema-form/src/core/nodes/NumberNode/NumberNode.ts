import type { NumberSchema, NumberValue } from '@/schema-form/types';

import { parseNumber } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { NodeMethod, type SchemaNodeConstructorProps } from '../type';

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

  #emitChange(input: NumberValue | undefined) {
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
    ajv,
  }: SchemaNodeConstructorProps<NumberSchema>) {
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });
    if (this.defaultValue !== undefined) this.setValue(this.defaultValue);
  }
}
