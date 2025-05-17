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
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
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
  #undefined: boolean = false;

  set #changed(input: boolean) {
    this.#dirty = input;
    if (this.#undefined) this.#undefined = false;
  }

  #seq: number = 0;
  #ids: IndexId[] = [];
  #sourceMap: Map<
    IndexId,
    {
      data: any;
      node: SchemaNode;
    }
  > = new Map();

  /**
   * 배열의 현재 값을 가져옵니다.
   * @returns 배열 노드의 현재 값 또는 undefined (비어 있는 경우)
   */
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

  /**
   * 배열 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  get children() {
    return this.#edges;
  }

  /**
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이
   */
  get length() {
    return this.#ids.length;
  }

  /** 하위 노드에 대해 pub-sub 링크를 활성화합니다. */
  activateLink() {
    for (const id of this.#ids)
      (this.#sourceMap.get(id)?.node as AbstractNode).activateLink(this.#host);
  }

  /**
   * BranchStrategy 객체를 초기화합니다.
   * @param host - 호스트 ArrayNode 객체
   * @param handleChange - 값 변경 핸들러
   * @param handleRefresh - 새로고침 핸들러
   * @param handleSetDefaultValue - 기본값 설정 핸들러
   * @param nodeFactory - 노드 생성 팩토리
   */
  constructor(
    host: ArrayNode,
    handleChange: Fn<[ArrayValue | undefined]>,
    handleRefresh: Fn<[ArrayValue | undefined]>,
    handleSetDefaultValue: Fn<[ArrayValue | undefined]>,
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
    handleSetDefaultValue(this.value);
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

    const defaultValue = data ?? getDefaultValue(this.#host.jsonSchema.items);
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

  /** 모든 요소를 삭제하여 배열을 초기화합니다. */
  clear() {
    for (let i = 0; i < this.#ids.length; i++)
      this.#sourceMap.get(this.#ids[i])?.node.cleanUp(this.#host);

    this.#ids = [];
    this.#sourceMap.clear();

    this.#changed = true;
    this.#publishRequestEmitChange();
    this.#publishUpdateChildren();
  }

  /**
   * 값 변경 이벤트를 발생시킵니다.
   * @param option - 옵션 설정 (기본값: SetValueOption.Default)
   * @private
   */
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

  /**
   * 자식 노드들의 정보를 가져옵니다.
   * @returns ID와 노드 정보를 포함한 배열
   * @private
   */
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
  /**
   * 내부 배열 상태를 객체 배열로 변환합니다.
   * @returns 배열의 값들을 포함한 배열
   * @private
   */
  #toArray() {
    const values = new Array<AllowedValue>(this.#ids.length);
    for (let i = 0; i < this.#ids.length; i++) {
      const edge = this.#sourceMap.get(this.#ids[i]);
      if (edge) values[i] = edge.data;
    }
    return values;
  }

  /**
   * 특정 요소의 값 변경을 처리하는 함수를 생성합니다.
   * @param id - 요소의 ID
   * @returns 값 변경 함수
   * @private
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
   * @private
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

  /**
   * 자식 노드 갱신 이벤트를 발행합니다.
   * @private
   */
  #publishUpdateChildren() {
    if (this.#locked) return;
    this.#host.publish({ type: NodeEventType.UpdateChildren });
  }

  /**
   * 값 변경 요청 이벤트를 발행합니다.
   * @param option - 변경 옵션 (선택 사항)
   * @private
   */
  #publishRequestEmitChange(option?: UnionSetValueOption) {
    if (this.#locked) return;
    this.#host.publish({
      type: NodeEventType.RequestEmitChange,
      payload: { [NodeEventType.RequestEmitChange]: option },
    });
  }
}
