import type { BooleanSchema, BooleanValue } from '@/schema-form/types';

import { parseBoolean } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { NodeEventType, type SchemaNodeConstructorProps } from '../type';

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
    const previous = this.#value;
    const current = this.parseValue(input);
    if (previous === current) return;
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

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    ajv,
  }: SchemaNodeConstructorProps<BooleanSchema>) {
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
