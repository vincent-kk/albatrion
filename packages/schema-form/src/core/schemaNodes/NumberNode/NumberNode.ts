import type { NumberSchema, NumberValue } from '@lumy/schema-form/types';

import { parseNumber } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { type ConstructorProps, MethodType } from '../type';

export class NumberNode extends BaseNode<NumberSchema, NumberValue> {
  readonly type = 'number';

  #value: NumberValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(value: NumberValue | undefined) {
    this.#emitChange(value);
  }
  parseValue(value: NumberValue | undefined) {
    return parseNumber(value, this.jsonSchema.type === 'integer');
  }

  #onChange: (value: NumberValue | undefined) => void;

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
  }: ConstructorProps<NumberValue>) {
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });

    this.#onChange = onChange;

    if (defaultValue !== undefined) {
      this.value = defaultValue;
    }

    if (defaultValue === undefined && jsonSchema.default !== undefined) {
      this.setDefaultValue(this.parseValue(jsonSchema.default));
      this.#emitChange(this.defaultValue);
    }
  }
}
