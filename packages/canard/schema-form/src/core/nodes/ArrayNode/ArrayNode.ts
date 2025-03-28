import type { SetStateFn } from '@aileron/types';

import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import type {
  AllowedValue,
  ArraySchema,
  ArrayValue,
} from '@/schema-form/types';

import { parseArray } from '../../parsers';
import { BaseNode } from '../BaseNode';
import {
  type BranchNodeConstructorProps,
  NodeEventType,
  type NodeFactory,
  type SchemaNode,
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
      for (const value of input) {
        this.push(value);
      }
      this.#locked = false;
      this.#emitChange();
    }
  }

  #emitChange() {
    if (this.#ready && this.#hasChanged) {
      const value = this.toArray();
      this.onChange(value);
      this.publish({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: value,
        },
      });
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

  #nodeFactory: NodeFactory;

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    nodeFactory,
    parentNode,
    validationMode,
    ajv,
  }: BranchNodeConstructorProps<ArraySchema>) {
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

    this.#nodeFactory = nodeFactory;

    this.#locked = true;

    // NOTE: defaultValue가 배열이고, 배열의 길이가 0보다 큰 경우
    if (this.defaultValue?.length)
      for (const value of this.defaultValue) this.push(value);

    while (this.length < (this.jsonSchema.minItems || 0)) this.push();

    this.#locked = false;

    this.#emitChange();
    this.#publishChildrenChange();
  }

  push(data?: ArrayValue[number]) {
    if (this.jsonSchema.maxItems && this.jsonSchema.maxItems <= this.length)
      return;

    this.#startOperation(OperationType.Push);

    const id = `[${this.#seq++}]` satisfies IndexId;
    const name = this.#ids.length.toString();
    this.#ids.push(id);
    const handleChange = (<T extends AllowedValue>(input: T) => {
      const value =
        typeof input === 'function'
          ? input(this.#sourceMap.get(id)!.data)
          : input;
      this.#updateData(id, value);
      if (this.#ready) this.onChange(this.toArray());
    }) satisfies SetStateFn<AllowedValue>;
    const defaultValue = data ?? getFallbackValue(this.jsonSchema.items);
    const childNode = this.#nodeFactory({
      key: id,
      name,
      jsonSchema: this.jsonSchema.items,
      parentNode: this,
      defaultValue,
      onChange: handleChange,
      nodeFactory: this.#nodeFactory,
    });
    this.#sourceMap.set(id, {
      node: childNode,
      data: childNode.value,
    });

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Push);
    this.#emitChange();
    this.#publishChildrenChange();
    return this;
  }

  update(id: IndexId | number, data: ArrayValue[number]) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;
    this.#sourceMap.get(targetId)?.node.setValue(data);
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
    this.#publishChildrenChange();
    return this;
  }

  clear() {
    this.#startOperation(OperationType.Clear);

    this.#ids = [];
    this.#sourceMap.clear();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Clear);
    this.#emitChange();
    this.#publishChildrenChange();
    return this;
  }

  #updateData(id: IndexId, data: ArrayValue[number]) {
    if (this.#sourceMap.has(id)) {
      this.#startOperation(OperationType.Update);

      this.#sourceMap.get(id)!.data = data;
      this.#hasChanged = true;

      this.#finishOperation(OperationType.Update);
      this.#emitChange();
    }
    return this;
  }

  #updateChildName() {
    this.#ids.forEach((id, index) => {
      if (this.#sourceMap.has(id)) {
        const node = this.#sourceMap.get(id)!.node;
        const name = index.toString();
        if (node.name !== name) node.setName(name, this);
      }
    });
  }

  #publishChildrenChange() {
    if (!this.#ready) return;
    this.publish({
      type: NodeEventType.UpdateChildren,
    });
  }
}
