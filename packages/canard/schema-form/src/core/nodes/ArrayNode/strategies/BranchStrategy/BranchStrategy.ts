import { isArray } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import {
  NodeEventType,
  type SchemaNode,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import type { AllowedValue, ArrayValue } from '@/schema-form/types';

import type { ArrayNode } from '../../ArrayNode';
import type { ArrayNodeStrategy } from '../type';

type IndexId = `[${number}]`;

export class BranchStrategy implements ArrayNodeStrategy {
  #host: ArrayNode;
  #handleChange: Fn<[ArrayValue | undefined]>;
  #handleRefresh: Fn<[ArrayValue | undefined]>;
  #nodeFactory: SchemaNodeFactory;

  #locked: boolean = true;
  #dirty: boolean = true;

  set #changed(value: boolean) {
    this.#dirty = value;
    if (this.#undefined) this.#undefined = false;
  }

  #undefined: boolean = false;

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
    if (this.#undefined) return undefined;
    return this.#toArray();
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  applyValue(input: ArrayValue, option: UnionSetValueOption) {
    if (input === undefined) {
      this.clear();
      this.#undefined = true;
      this.#publishRequestEmitChange(option);
    } else if (isArray(input)) {
      this.#locked = true;
      this.clear();
      for (const value of input) this.push(value);
      this.#locked = false;
      this.#publishRequestEmitChange(option);
    }
  }

  get children() {
    return this.#edges;
  }

  get length() {
    return this.#ids.length;
  }

  activateLink() {
    for (const id of this.#ids)
      (this.#sourceMap.get(id)?.node as AbstractNode).activateLink(this.#host);
    return true;
  }

  constructor(
    host: ArrayNode,
    handleChange: Fn<[ArrayValue | undefined]>,
    handleRefresh: Fn<[ArrayValue | undefined]>,
    nodeFactory: SchemaNodeFactory,
  ) {
    this.#host = host;
    this.#handleChange = handleChange;
    this.#handleRefresh = handleRefresh;
    this.#nodeFactory = nodeFactory;

    // NOTE: defaultValue가 배열이고, 배열의 길이가 0보다 큰 경우
    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);

    while (this.length < (host.jsonSchema.minItems || 0)) this.push();

    this.#host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange)
        this.#emitChange(payload?.[NodeEventType.RequestEmitChange]);
    });

    this.#locked = false;

    this.#emitChange();
    this.#publishUpdateChildren();
  }

  /**
   * 배열에 새 요소를 추가합니다.
   * @param data - 추가할 값 (생략 가능)
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  push(data?: ArrayValue[number]) {
    if (
      this.#host.jsonSchema.maxItems &&
      this.#host.jsonSchema.maxItems <= this.length
    )
      return;

    const id = `[${this.#seq++}]` satisfies IndexId;
    const name = this.#ids.length.toString();
    this.#ids.push(id);

    const defaultValue = data ?? getFallbackValue(this.#host.jsonSchema.items);
    const childNode = this.#nodeFactory({
      key: id,
      name,
      jsonSchema: this.#host.jsonSchema.items,
      parentNode: this.#host,
      defaultValue,
      onChange: this.#handleChangeFactory(id),
      nodeFactory: this.#nodeFactory,
    });
    this.#sourceMap.set(id, {
      node: childNode,
      data: childNode.value,
    });

    if (this.#host.activated)
      (childNode as AbstractNode).activateLink(this.#host);

    this.#changed = true;
    this.#publishRequestEmitChange();
    this.#publishUpdateChildren();
  }

  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  update(id: IndexId | number, data: ArrayValue[number]) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;
    this.#sourceMap.get(targetId)?.node.setValue(data);
  }

  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  remove(id: IndexId | number) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;

    this.#ids = this.#ids.filter((id) => id !== targetId);
    this.#sourceMap.delete(targetId);
    this.#updateChildName();

    this.#changed = true;
    this.#publishRequestEmitChange();
    this.#publishUpdateChildren();
  }

  /**
   * 모든 요소를 삭제하여 배열을 초기화합니다.
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  clear() {
    for (let i = 0; i < this.#ids.length; i++)
      this.#sourceMap.get(this.#ids[i])?.node.cleanUp(this.#host);

    this.#ids = [];
    this.#sourceMap.clear();

    this.#changed = true;
    this.#publishRequestEmitChange();
    this.#publishUpdateChildren();
  }

  #emitChange(option: UnionSetValueOption = SetValueOption.Default) {
    if (this.#locked || !this.#dirty) return;
    const value = this.value;
    if (option & SetValueOption.EmitChange) this.#handleChange(value);
    if (option & SetValueOption.Propagate) this.#publishUpdateChildren();
    if (option & SetValueOption.Refresh) this.#handleRefresh(value);
    if (option & SetValueOption.PublishUpdateEvent)
      this.#host.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: value },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: undefined,
            current: value,
          },
        },
      });
    this.#dirty = false;
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
  #toArray() {
    const values = new Array<AllowedValue>(this.#ids.length);
    for (let i = 0; i < this.#ids.length; i++) {
      const edge = this.#sourceMap.get(this.#ids[i]);
      if (edge) values[i] = edge.data;
    }
    return values;
  }

  /**
   * 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID
   * @param data - 새로운 값
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  #handleChangeFactory(id: IndexId) {
    return (data: unknown) => {
      if (!this.#sourceMap.has(id)) return;
      this.#sourceMap.get(id)!.data = data;
      this.#changed = true;
      this.#publishRequestEmitChange();
    };
  }

  /**
   * 배열 요소의 이름을 갱신합니다.
   */
  #updateChildName() {
    for (let index = 0; index < this.#ids.length; index++) {
      const id = this.#ids[index];
      if (this.#sourceMap.has(id)) {
        const node = this.#sourceMap.get(id)!.node;
        const name = index.toString();
        if (node.name !== name) node.setName(name, this.#host);
      }
    }
  }

  #publishUpdateChildren() {
    if (this.#locked) return;
    this.#host.publish({ type: NodeEventType.UpdateChildren });
  }

  #publishRequestEmitChange(option?: UnionSetValueOption) {
    if (this.#locked) return;
    this.#host.publish({
      type: NodeEventType.RequestEmitChange,
      payload: { [NodeEventType.RequestEmitChange]: option },
    });
  }
}
