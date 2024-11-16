import type { VirtualNodeValue, VirtualSchema } from '@lumy/schema-form/types';

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
  setValue(
    input:
      | VirtualNodeValue
      | undefined
      | ((prev: VirtualNodeValue | undefined) => VirtualNodeValue | undefined),
  ) {
    const inputValue = typeof input === 'function' ? input(this.#value) : input;
    this.#emitChange(inputValue);
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
    parentNode,
    refNodes,
    ajv,
  }: VirtualNodeConstructorProps<VirtualSchema>) {
    super({ key, name, jsonSchema, defaultValue, parentNode, ajv });

    this.#refNodes = refNodes || [];
    this.#children = this.#refNodes.map((node) => ({ node }));

    if (this.defaultValue !== undefined) {
      this.#value = this.defaultValue;
    }

    this.#refNodes.forEach((node, i) => {
      node.subscribe((type, payload) => {
        if (type !== MethodType.Change) return;
        if (this.#value && this.#value[i] !== payload) {
          this.#value = [
            ...this.#value.slice(0, i),
            payload,
            ...this.#value.slice(i + 1),
          ];
          this.publish(MethodType.Change, this.#value);
        }
      });
    });
  }
}
