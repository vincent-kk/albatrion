import type { BooleanSchema, BooleanValue } from '@/schema-form/types';

import { parseBoolean } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import { NodeEventType, type SchemaNodeConstructorProps } from '../type';

export class BooleanNode extends AbstractNode<BooleanSchema, BooleanValue> {
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
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: current,
      },
      options: {
        [NodeEventType.UpdateValue]: {
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
