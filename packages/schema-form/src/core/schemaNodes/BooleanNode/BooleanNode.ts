import type { BooleanSchema, BooleanValue } from '@lumy/schema-form/types';

import { parseBoolean } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { type ConstructorProps, MethodType } from '../type';

export class BooleanNode extends BaseNode<BooleanSchema, BooleanValue> {
  readonly type = 'boolean';

  #value: BooleanValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(value: BooleanValue | undefined) {
    this.#emitChange(value);
  }
  parseValue(value: BooleanValue | undefined) {
    return parseBoolean(value);
  }

  #onChange: (value: BooleanValue | undefined) => void;

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
  }: ConstructorProps<BooleanValue>) {
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
