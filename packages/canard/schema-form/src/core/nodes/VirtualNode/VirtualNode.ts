import type { VirtualNodeValue, VirtualSchema } from '@/schema-form/types';

import { parseArray } from '../../parsers';
import { BaseNode } from '../BaseNode';
import {
  NodeMethod,
  type SchemaNode,
  type VirtualNodeConstructorProps,
} from '../type';

export class VirtualNode extends BaseNode<VirtualSchema, VirtualNodeValue> {
  #value: VirtualNodeValue | undefined = undefined;
  get value() {
    return this.#value;
  }
  set value(input: VirtualNodeValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: VirtualNodeValue | undefined) {
    this.#emitChange(input);
  }
  parseValue(input: VirtualNodeValue) {
    return parseArray(input);
  }

  #refNodes: SchemaNode[] = [];
  #children: { node: SchemaNode }[];
  get children() {
    return this.#children;
  }

  #emitChange(values: VirtualNodeValue | undefined) {
    if (values && values.length === this.#refNodes.length) {
      values.forEach((value, i) => {
        const node = this.#refNodes[i];
        if (node.value !== value) {
          node.setValue(value);
        }
      });
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

    if (this.defaultValue !== undefined) {
      this.#value = this.defaultValue;
    }

    this.#refNodes.forEach((node, i) => {
      node.subscribe(({ type, payload }) => {
        if (!(type & NodeMethod.Change)) return;
        const onChangePayload = payload?.[NodeMethod.Change];
        if (this.#value && this.#value[i] !== onChangePayload) {
          const previous = this.#value;
          this.#value = [
            ...this.#value.slice(0, i),
            onChangePayload,
            ...this.#value.slice(i + 1),
          ];
          this.publish({
            type: NodeMethod.Change,
            payload: {
              [NodeMethod.Change]: this.#value,
            },
            options: {
              [NodeMethod.Change]: {
                previous,
                current: this.#value,
                difference: { i: onChangePayload },
              },
            },
          });
        }
      });
    });

    this.#children = this.#refNodes.map((node) => ({ node }));
    this.publish({
      type: NodeMethod.ChildrenChange,
    });
  }
}
