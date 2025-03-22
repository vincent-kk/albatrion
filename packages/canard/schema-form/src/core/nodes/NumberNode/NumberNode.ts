import type { NumberSchema, NumberValue } from '@/schema-form/types';

import { parseNumber } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { NodeEventType, type SchemaNodeConstructorProps } from '../type';

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
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: current,
        },
        options: {
          [NodeEventType.Change]: {
            previous,
            current,
          },
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
  }: SchemaNodeConstructorProps<NumberSchema>) {
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
