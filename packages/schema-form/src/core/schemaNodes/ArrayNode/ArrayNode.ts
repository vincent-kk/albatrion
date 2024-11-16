import type {
  AllowedValue,
  ArraySchema,
  ArrayValue,
} from '@lumy/schema-form/types';

import { parseArray } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { nodeFactory } from '../nodeFactory';
import {
  MethodType,
  type SchemaNode,
  type SchemaNodeConstructorProps,
} from '../type';

type IndexId = `[${number}]`;

export class ArrayNode extends BaseNode<ArraySchema, ArrayValue> {
  readonly type = 'array';

  #mount: boolean = false;
  #ready: boolean = true;
  #hasChanged: boolean = false;

  #seq: number = 0;
  #ids: IndexId[] = [];
  #sourceMap: Map<
    IndexId,
    {
      data: any;
      node: SchemaNode;
    }
  > = new Map();

  get value() {
    return this.toArray();
  }
  set value(input: ArrayValue) {
    if (Array.isArray(input)) {
      this.#ready = false;
      this.clear();
      input.forEach((value) => {
        this.push(value);
      });
      this.#ready = true;
      this.#emitChange();
    }
  }

  #onChange: (value: ArrayValue) => void;

  #emitChange() {
    if (this.#ready && this.#hasChanged) {
      const value = this.toArray();
      this.#onChange(value);
      this.publish(MethodType.Change, value);
      this.#hasChanged = false;
    }
  }

  parseValue(input: ArrayValue) {
    return parseArray(input);
  }

  /** ArrayNode의 자식 노드들 */
  get children() {
    return this.#edges;
  }

  get #edges() {
    return this.#ids.map((id) => ({
      id,
      node: this.#sourceMap.get(id)!.node,
    }));
  }

  get length() {
    return this.#ids.length;
  }

  toArray() {
    return this.#edges.map(({ node }) => node?.value);
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: SchemaNodeConstructorProps<ArraySchema>) {
    super({ key, name, jsonSchema, defaultValue, parentNode, ajv });

    this.#onChange = onChange;

    if (Array.isArray(defaultValue)) {
      defaultValue.forEach((value) => {
        this.push(value);
      });
      this.#hasChanged = true;
    }

    while (this.length < (this.jsonSchema.minItems || 0)) {
      this.push();
    }

    this.#mount = true;
    this.#ready = true;

    this.#emitChange();
  }

  push(data?: ArrayValue[number]) {
    if (this.jsonSchema.maxItems && this.jsonSchema.maxItems <= this.length) {
      return;
    }

    const id = `[${this.#seq++}]` satisfies IndexId;
    const name = `${this.#ids.length}`;

    this.#ids.push(id);

    const handleChange = (value: AllowedValue | undefined) => {
      this.update(id, value);
      if (this.#mount) {
        this.#onChange(this.toArray());
      }
    };

    const defaultValue =
      data ??
      this.jsonSchema.items?.default ??
      (this.jsonSchema.items?.type === 'object'
        ? {}
        : this.jsonSchema.items.type === 'array'
          ? []
          : undefined);

    this.#sourceMap.set(id, {
      node: nodeFactory({
        key: id,
        name,
        jsonSchema: this.jsonSchema.items,
        defaultValue,
        parentNode: this,
        onChange: handleChange,
      }),
      data: defaultValue,
    });
    this.#hasChanged = true;
    this.#emitChange();
    return this;
  }

  update(id: IndexId, data: ArrayValue[number]) {
    if (this.#sourceMap.has(id)) {
      this.#sourceMap.get(id)!.data = data;
    }
    this.#hasChanged = true;
    this.#emitChange();
    return this;
  }

  remove(id: IndexId | number) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;
    this.#ids = this.#ids.filter((id) => id !== targetId);
    this.#sourceMap.delete(targetId);
    this.#updateChildName();
    this.#hasChanged = true;
    this.#emitChange();
    return this;
  }

  clear() {
    this.#ids = [];
    this.#sourceMap.clear();
    this.#hasChanged = true;
    this.#emitChange();
    return this;
  }

  #updateChildName() {
    this.#ids.forEach((id, index) => {
      if (this.#sourceMap.get(id)?.node) {
        const node = this.#sourceMap.get(id)!.node;
        const name = index.toString();
        if (node.name !== name) {
          node.setName(name, this);
        }
      }
    });
  }
}
