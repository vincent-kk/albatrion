import type { NumberSchema, NumberValue } from '@/schema-form/types';

import { parseNumber } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';

export class NumberNode extends AbstractNode<NumberSchema, NumberValue> {
  #value: NumberValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: NumberValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(
    this: NumberNode,
    input: NumberValue | undefined,
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  #parseValue(this: NumberNode, input: NumberValue | undefined) {
    return parseNumber(input, this.jsonSchema.type === 'integer');
  }
  #emitChange(
    this: NumberNode,
    input: NumberValue | undefined,
    option: UnionSetValueOption,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    if (previous === current) return;
    this.#value = current;

    if (option & SetValueOption.EmitChange) this.onChange(current);
    if (option & SetValueOption.Refresh) this.refresh(current);

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
    if (this.defaultValue !== undefined)
      this.setValue(this.defaultValue, SetValueOption.EmitChange);
    this.prepare();
  }
}
