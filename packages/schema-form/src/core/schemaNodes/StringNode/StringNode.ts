import type { StringSchema, StringValue } from '@lumy/schema-form/types';

import { parseString } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { MethodType, type SchemaNodeConstructorProps } from '../type';

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
  }: SchemaNodeConstructorProps<StringSchema>) {
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
