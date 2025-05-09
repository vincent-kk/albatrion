import type { NullSchema, NullValue } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNodeConstructorProps,
  SetValueOption,
  type UnionSetValueOption,
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
    option: UnionSetValueOption,
  ) {
    this.#emitChange(input, option);
  }

  #parseValue(this: NullNode, input: NullValue | undefined) {
    return input;
  }
  #emitChange(
    this: NullNode,
    input: NullValue | undefined,
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
      this.setValue(this.defaultValue, SetValueOption.EmitChange);
    this.prepare();
  }
}
