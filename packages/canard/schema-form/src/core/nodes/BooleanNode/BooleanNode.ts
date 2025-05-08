import type { BooleanSchema, BooleanValue } from '@/schema-form/types';

import { parseBoolean } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
} from '../type';

export class BooleanNode extends AbstractNode<BooleanSchema, BooleanValue> {
  #value: BooleanValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: BooleanValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(
    this: BooleanNode,
    input: BooleanValue | undefined,
    option: SetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  #parseValue(this: BooleanNode, input: BooleanValue | undefined) {
    return parseBoolean(input);
  }
  #emitChange(
    this: BooleanNode,
    input: BooleanValue | undefined,
    option: SetValueOption,
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
    if (this.defaultValue !== undefined)
      this.setValue(this.defaultValue, SetValueOption.EmitChange);
    this.prepare();
  }
}
