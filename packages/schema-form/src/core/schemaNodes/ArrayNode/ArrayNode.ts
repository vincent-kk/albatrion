import type {
  AllowedValue,
  ArraySchema,
  ArrayValue,
} from '@lumy/schema-form/types';

import { parseArray } from '../../parsers';
import { BaseNode } from '../BaseNode';
import { getFallbackValue } from '../BaseNode/utils';
import { schemaNodeFactory } from '../schemaNodeFactory';
import {
  MethodType,
  type SchemaNode,
  type SchemaNodeConstructorProps,
} from '../type';
import { OperationType } from './type';

type IndexId = `[${number}]`;

export class ArrayNode extends BaseNode<ArraySchema, ArrayValue> {
  #locked: boolean = false;
  #operation: OperationType = OperationType.Idle;
  #hasChanged: boolean = true;

  #seq: number = 0;
  #ids: IndexId[] = [];
  #sourceMap: Map<
    IndexId,
    {
      data: any;
      node: SchemaNode;
    }
  > = new Map();

  #startOperation(operation: OperationType) {
    this.#operation |= operation;
  }

  #finishOperation(operation: OperationType) {
    this.#operation &= ~operation;
  }

  get #ready() {
    return !this.#locked && this.#operation === OperationType.Idle;
  }

  get value() {
    return this.toArray();
  }
  set value(input: ArrayValue | undefined) {
    this.setValue(input);
  }
  protected applyValue(input: ArrayValue | undefined) {
    if (Array.isArray(input)) {
      this.#locked = true;
      this.clear();
      input.forEach((value) => {
        this.push(value);
      });
      this.#locked = false;
      this.#emitChange();
    }
  }

  #onChange: SetStateFn<ArrayValue | undefined>;

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
    return this.#edges.map(({ node }) => node.value);
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

    this.#locked = true;

    if (Array.isArray(defaultValue)) {
      defaultValue.forEach((value) => {
        this.push(value);
      });
    }

    while (this.length < (this.jsonSchema.minItems || 0)) {
      this.push();
    }

    this.#locked = false;

    this.#emitChange();
  }

  push(data?: ArrayValue[number]) {
    if (this.jsonSchema.maxItems && this.jsonSchema.maxItems <= this.length) {
      return;
    }

    const id = `[${this.#seq++}]` satisfies IndexId;
    const name = `${this.#ids.length}`;

    this.#startOperation(OperationType.Push);

    this.#ids.push(id);
    const handleChange: SetStateFn<AllowedValue | undefined> = (input) => {
      const value =
        typeof input === 'function'
          ? input(this.#sourceMap.get(id)!.data)
          : input;
      this.update(id, value);
      if (this.#ready) {
        this.#onChange(this.toArray());
      }
    };
    const defaultValue = data ?? getFallbackValue(this.jsonSchema.items);
    this.#sourceMap.set(id, {
      node: schemaNodeFactory({
        key: id,
        name,
        jsonSchema: this.jsonSchema.items,
        parentNode: this,
        defaultValue,
        onChange: handleChange,
      }),
      data: defaultValue,
    });

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Push);

    this.#emitChange();
    return this;
  }

  update(id: IndexId, data: ArrayValue[number]) {
    this.#startOperation(OperationType.Update);

    if (this.#sourceMap.has(id)) {
      this.#sourceMap.get(id)!.data = data;
      this.#hasChanged = true;
    }

    this.#finishOperation(OperationType.Update);

    this.#emitChange();
    return this;
  }

  remove(id: IndexId | number) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;

    this.#startOperation(OperationType.Remove);

    this.#ids = this.#ids.filter((id) => id !== targetId);
    this.#sourceMap.delete(targetId);
    this.#updateChildName();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Remove);

    this.#emitChange();
    return this;
  }

  clear() {
    this.#startOperation(OperationType.Clear);

    this.#ids = [];
    this.#sourceMap.clear();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Clear);

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
