import type { StringSchema, StringValue } from '@/schema-form/types';

import { parseString } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { NodeEventType, type SchemaNodeConstructorProps } from '../type';

export class StringNode extends BaseNode<StringSchema, StringValue> {
  #value: StringValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: StringValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: StringValue | undefined) {
    this.#emitChange(input);
  }
  parseValue(input: StringValue | undefined) {
    return parseString(input);
  }

  #emitChange(input: StringValue | undefined) {
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
  }: SchemaNodeConstructorProps<StringSchema>) {
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
