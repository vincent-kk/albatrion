import { map } from '@winglet/common-utils';

import {
  SetStateOption,
  type VirtualNodeValue,
  type VirtualSchema,
} from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNode,
  type VirtualNodeConstructorProps,
} from '../type';

export class VirtualNode extends AbstractNode<VirtualSchema, VirtualNodeValue> {
  #value: VirtualNodeValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: VirtualNodeValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(
    this: VirtualNode,
    input: VirtualNodeValue | undefined,
    option: SetStateOption,
  ) {
    this.#emitChange(input, option);
  }

  #refNodes: SchemaNode[] = [];
  #children: { node: SchemaNode }[];
  get children() {
    return this.#children;
  }

  #emitChange(
    this: VirtualNode,
    values: VirtualNodeValue | undefined,
    option: SetStateOption,
  ) {
    if (values && values.length === this.#refNodes.length) {
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const node = this.#refNodes[i];
        if (node.value !== value) node.setValue(value);
      }
      if (option & SetStateOption.Propagate) this.refresh(values);
    }
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    refNodes,
    validationMode,
    ajv,
  }: VirtualNodeConstructorProps<VirtualSchema>) {
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

    this.#refNodes = refNodes || [];

    if (this.defaultValue !== undefined) this.#value = this.defaultValue;

    for (let index = 0; index < this.#refNodes.length; index++) {
      const node = this.#refNodes[index];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const onChangePayload = payload?.[NodeEventType.UpdateValue];
          if (this.#value && this.#value[index] !== onChangePayload) {
            const previous = this.#value;
            this.#value = [
              ...this.#value.slice(0, index),
              onChangePayload,
              ...this.#value.slice(index + 1),
            ];
            this.publish({
              type: NodeEventType.UpdateValue,
              payload: {
                [NodeEventType.UpdateValue]: this.#value,
              },
              options: {
                [NodeEventType.UpdateValue]: {
                  previous,
                  current: this.#value,
                },
              },
            });
          }
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.#children = map(this.#refNodes, (node) => ({ node }));

    this.publish({
      type: NodeEventType.UpdateChildren,
    });

    this.prepare();
  }
}
