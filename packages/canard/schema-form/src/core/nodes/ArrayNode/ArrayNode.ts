import { isArray } from '@winglet/common-utils';

import type { SetStateFn } from '@aileron/types';

import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import {
  type AllowedValue,
  type ArraySchema,
  type ArrayValue,
  SetStateOption,
} from '@/schema-form/types';

import { parseArray } from '../../parsers';
import { AbstractNode } from '../AbstractNode';
import {
  type BranchNodeConstructorProps,
  NodeEventType,
  type NodeFactory,
  type SchemaNode,
} from '../type';
import { OperationType } from './type';

type IndexId = `[${number}]`;

export class ArrayNode extends AbstractNode<ArraySchema, ArrayValue> {
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
  set value(input: ArrayValue) {
    this.setValue(input);
  }
  protected applyValue(input: ArrayValue, option: SetStateOption) {
    if (!isArray(input)) return;
    this.#locked = true;
    this.clear(SetStateOption.None);
    for (const value of input) this.push(value);
    this.#locked = false;
    this.#emitChange(option);
  }

  #emitChange(option: SetStateOption) {
    if (this.#ready && this.#hasChanged) {
      const value = this.value;
      this.onChange(value);
      this.publish({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: value,
        },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: undefined,
            current: value,
          },
        },
      });

      if (option & SetStateOption.Refresh) {
        this.refresh(value);
        this.#publishChildrenChange();
      }

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
    const edges = new Array<{ id: IndexId; node: SchemaNode }>(
      this.#ids.length,
    );
    for (let i = 0; i < this.#ids.length; i++) {
      const id = this.#ids[i];
      edges[i] = {
        id,
        node: this.#sourceMap.get(id)!.node,
      };
    }
    return edges;
  }

  get length() {
    return this.#ids.length;
  }

  toArray() {
    const values = new Array<AllowedValue>(this.#ids.length);
    for (let i = 0; i < this.#ids.length; i++) {
      const edge = this.#sourceMap.get(this.#ids[i]);
      if (edge) values[i] = edge.node.value;
    }
    return values;
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

    this.#emitChange(SetStateOption.None);
    this.#publishChildrenChange();
  }

  push(
    data?: ArrayValue[number],
    option: SetStateOption = SetStateOption.Reset,
  ) {
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
    this.#emitChange(option);
    this.#publishChildrenChange();
    return this;
  }

  update(
    id: IndexId | number,
    data: ArrayValue[number],
    option: SetStateOption = SetStateOption.Reset,
  ) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;
    this.#sourceMap.get(targetId)?.node.setValue(data, option);
    return this;
  }

  remove(id: IndexId | number, option: SetStateOption = SetStateOption.Reset) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;

    this.#startOperation(OperationType.Remove);

    this.#ids = this.#ids.filter((id) => id !== targetId);
    this.#sourceMap.delete(targetId);
    this.#updateChildName();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Remove);
    this.#emitChange(option);
    this.#publishChildrenChange();
    return this;
  }

  clear(option: SetStateOption = SetStateOption.Reset) {
    this.#startOperation(OperationType.Clear);

    this.#ids = [];
    this.#sourceMap.clear();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Clear);
    this.#emitChange(option);
    this.#publishChildrenChange();
    return this;
  }

  #updateData(id: IndexId, data: ArrayValue[number]) {
    if (this.#sourceMap.has(id)) {
      this.#startOperation(OperationType.Update);

      this.#sourceMap.get(id)!.data = data;
      this.#hasChanged = true;

      this.#finishOperation(OperationType.Update);
      this.#emitChange(SetStateOption.None);
    }
    return this;
  }

  #updateChildName() {
    for (let index = 0; index < this.#ids.length; index++) {
      const id = this.#ids[index];
      if (this.#sourceMap.has(id)) {
        const node = this.#sourceMap.get(id)!.node;
        const name = index.toString();
        if (node.name !== name) node.setName(name, this);
      }
    }
  }

  #publishChildrenChange() {
    if (!this.#ready) return;
    this.publish({
      type: NodeEventType.UpdateChildren,
    });
  }
}
