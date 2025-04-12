import {
  SetStateOption,
  type StringSchema,
  type StringValue,
} from '@/schema-form/types';

import { parseString } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import { NodeEventType, type SchemaNodeConstructorProps } from '../type';

export class StringNode extends AbstractNode<StringSchema, StringValue> {
  #value: StringValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: StringValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: StringValue | undefined, option: SetStateOption) {
    this.#emitChange(input, option);
  }
  parseValue(input: StringValue | undefined) {
    return parseString(input);
  }

  #emitChange(input: StringValue | undefined, option: SetStateOption) {
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
    if (option & SetStateOption.Refresh) this.refresh(current);
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
    if (this.defaultValue !== undefined)
      this.setValue(this.defaultValue, SetStateOption.None);
  }
}
