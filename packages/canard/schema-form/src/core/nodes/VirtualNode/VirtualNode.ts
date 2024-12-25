import type { VirtualNodeValue, VirtualSchema } from '@/schema-form/types';

import { parseArray } from '../../parsers';
import { BaseNode } from '../BaseNode';
import {
  MethodType,
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
    ajv,
  }: VirtualNodeConstructorProps<VirtualSchema>) {
    super({ key, name, jsonSchema, defaultValue, onChange, parentNode, ajv });

    this.#refNodes = refNodes || [];

    if (this.defaultValue !== undefined) {
      this.#value = this.defaultValue;
    }

    this.#refNodes.forEach((node, i) => {
      node.subscribe(({ type, payload }) => {
        if (type !== MethodType.Change) return;
        if (this.#value && this.#value[i] !== payload) {
          const previous = this.#value;
          this.#value = [
            ...this.#value.slice(0, i),
            payload,
            ...this.#value.slice(i + 1),
          ];
          this.publish({
            type: MethodType.Change,
            payload: this.#value,
            options: {
              previous,
              current: this.#value,
              difference: { i: payload },
            },
          });
        }
      });
    });

    this.#children = this.#refNodes.map((node) => ({ node }));
    this.publish({
      type: MethodType.ChildrenChange,
    });
  }
}
