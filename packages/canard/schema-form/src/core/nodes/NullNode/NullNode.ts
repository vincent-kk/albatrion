import type { NullSchema, NullValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
} from '../type';

export class NullNode extends AbstractNode<NullSchema, NullValue> {
  #value: NullValue | undefined;
  get value() {
    return this.#value;
  }
  set value(input: NullValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(
    this: NullNode,
    input: NullValue | undefined,
    option: SetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  #parseValue(this: NullNode, input: NullValue | undefined) {
    return input;
  }
  #emitChange(
    this: NullNode,
    input: NullValue | undefined,
    option: SetValueOption,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
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
    if (option & SetValueOption.Propagate) this.refresh(current);
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
  }: SchemaNodeConstructorProps<NullSchema>) {
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
      this.setValue(this.defaultValue, SetValueOption.Merge);
    this.prepare();
  }
}
