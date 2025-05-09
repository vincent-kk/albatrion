import { map } from '@winglet/common-utils';

import type { VirtualNodeValue, VirtualSchema } from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  NodeEventType,
  type SchemaNode,
  SetValueOption,
  type UnionSetValueOption,
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
    option: UnionSetValueOption,
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
    option: UnionSetValueOption,
  ) {
    if (!values || values.length !== this.#refNodes.length) return;
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const node = this.#refNodes[i];
      if (node.value !== value) node.setValue(value, option);
    }
    if (option & SetValueOption.Refresh) this.refresh(values);
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
            this.#value = [...this.#value];
            this.#value[index] = onChangePayload;
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
