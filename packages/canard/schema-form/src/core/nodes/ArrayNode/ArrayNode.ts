import { isArray } from '@winglet/common-utils';

import type { SetStateFn } from '@aileron/declare';

import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import type {
  AllowedValue,
  ArraySchema,
  ArrayValue,
} from '@/schema-form/types';

import { AbstractNode } from '../AbstractNode';
import {
  type BranchNodeConstructorProps,
  NodeEventType,
  type SchemaNode,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '../type';
import { OperationType } from './type';

type IndexId = `[${number}]`;

/**
 * 배열 스키마를 처리하기 위한 노드 클래스입니다.
 * 배열의 각 요소를 관리하고 추가/삭제/업데이트 기능을 제공합니다.
 */
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

  /**
   * 지정된 작업을 시작합니다.
   * @param operation - 시작할 작업 타입
   */
  #startOperation(this: ArrayNode, operation: OperationType) {
    this.#operation |= operation;
  }

  /**
   * 지정된 작업을 완료합니다.
   * @param operation - 완료할 작업 타입
   */
  #finishOperation(this: ArrayNode, operation: OperationType) {
    this.#operation &= ~operation;
  }

  /**
   * 현재 작업이 완료되었고 잠금이 풀렸는지 확인합니다.
   * @returns 노드가 준비 상태인지 여부
   */
  get #ready() {
    return !this.#locked && this.#operation === OperationType.Idle;
  }

  /**
   * 배열 노드의 값을 가져옵니다.
   * @returns 배열 값 또는 undefined
   */
  get value() {
    if (this.#ids.length === 0) return undefined;
    return this.#toArray();
  }
  /**
   * 배열 노드의 값을 설정합니다.
   * @param input - 설정할 배열 값
   */
  set value(input: ArrayValue | undefined) {
    this.setValue(input);
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  protected applyValue(
    this: ArrayNode,
    input: ArrayValue,
    option: UnionSetValueOption,
  ) {
    if (input === undefined) {
      this.clear();
      this.#emitChange(option);
    } else if (isArray(input)) {
      this.#locked = true;
      this.clear();
      for (const value of input) this.push(value);
      this.#locked = false;
      this.#emitChange(option);
    }
  }

  /**
   * 값 변경을 반영하고 관련 이벤트를 발행합니다.
   * @param option - 설정 옵션
   */
  #emitChange(this: ArrayNode, option: UnionSetValueOption) {
    if (this.#ready && this.#hasChanged) {
      const value = this.value;
      if (option & SetValueOption.EmitChange) this.onChange(value);
      if (option & SetValueOption.Propagate) this.#publishChildrenChange();
      if (option & SetValueOption.Refresh) this.refresh(value);
      this.#hasChanged = false;

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
    }
  }

  /** ArrayNode의 자식 노드들 */
  /**
   * 배열 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  get children() {
    return this.#edges;
  }

  /**
   * 자식 노드의 ID와 노드 객체를 반환합니다.
   * @returns 자식 노드와 ID 정보
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
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이
   */
  get length() {
    return this.#ids.length;
  }

  /**
   * 내부 데이터를 배열로 변환합니다.
   * @returns 밀집한 배열 값
   */
  #toArray(this: ArrayNode) {
    const values = new Array<AllowedValue>(this.#ids.length);
    for (let i = 0; i < this.#ids.length; i++) {
      const edge = this.#sourceMap.get(this.#ids[i]);
      if (edge) values[i] = edge.node.value;
    }
    return values;
  }

  /**
   * 노드를 초기화하고 자식 노드를 준비합니다.
   * @param actor - 준비를 요청한 노드
   * @returns 초기화 완료 여부
   */
  prepare(this: ArrayNode, actor?: SchemaNode): boolean {
    if (super.prepare(actor)) {
      for (let i = 0; i < this.#ids.length; i++)
        (this.#sourceMap.get(this.#ids[i])?.node as AbstractNode).prepare(this);
      return true;
    }
    return false;
  }

  #nodeFactory: SchemaNodeFactory;

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

    this.#emitChange(SetValueOption.EmitChange);
    this.#publishChildrenChange();

    this.prepare();
  }

  /**
   * 배열에 새 요소를 추가합니다.
   * @param data - 추가할 값 (생략 가능)
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  push(this: ArrayNode, data?: ArrayValue[number]) {
    if (this.jsonSchema.maxItems && this.jsonSchema.maxItems <= this.length)
      return;

    this.#startOperation(OperationType.Push);

    const id = `[${this.#seq++}]` satisfies IndexId;
    const name = this.#ids.length.toString();
    this.#ids.push(id);
    const handleChange = (<T extends AllowedValue>(input: T) => {
      this.#updateData(id, input);
      if (this.#ready) this.onChange(this.value);
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
    this.#emitChange(SetValueOption.EmitChange);
    this.#publishChildrenChange();
    return this;
  }

  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  update(this: ArrayNode, id: IndexId | number, data: ArrayValue[number]) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;
    this.#sourceMap.get(targetId)?.node.setValue(data);
    return this;
  }

  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  remove(this: ArrayNode, id: IndexId | number) {
    const targetId = typeof id === 'number' ? this.#ids[id] : id;

    this.#startOperation(OperationType.Remove);

    this.#ids = this.#ids.filter((id) => id !== targetId);
    this.#sourceMap.delete(targetId);
    this.#updateChildName();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Remove);
    this.#emitChange(SetValueOption.EmitChange);
    this.#publishChildrenChange();
    return this;
  }

  /**
   * 모든 요소를 삭제하여 배열을 초기화합니다.
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  clear(this: ArrayNode) {
    this.#startOperation(OperationType.Clear);

    for (let i = 0; i < this.#ids.length; i++)
      this.#sourceMap.get(this.#ids[i])?.node.cleanUp(this);

    this.#ids = [];
    this.#sourceMap.clear();

    this.#hasChanged = true;
    this.#finishOperation(OperationType.Clear);
    this.#emitChange(SetValueOption.EmitChange);
    this.#publishChildrenChange();
    return this;
  }

  /**
   * 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID
   * @param data - 새로운 값
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  #updateData(this: ArrayNode, id: IndexId, data: ArrayValue[number]) {
    if (this.#sourceMap.has(id)) {
      this.#startOperation(OperationType.Update);

      this.#sourceMap.get(id)!.data = data;
      this.#hasChanged = true;

      this.#finishOperation(OperationType.Update);
      this.#emitChange(SetValueOption.EmitChange);
    }
    return this;
  }

  /**
   * 배열 요소의 이름을 갱신합니다.
   */
  #updateChildName(this: ArrayNode) {
    for (let index = 0; index < this.#ids.length; index++) {
      const id = this.#ids[index];
      if (this.#sourceMap.has(id)) {
        const node = this.#sourceMap.get(id)!.node;
        const name = index.toString();
        if (node.name !== name) node.setName(name, this);
      }
    }
  }

  /**
   * 자식 노드 변경 이벤트를 발행합니다.
   */
  #publishChildrenChange(this: ArrayNode) {
    if (!this.#ready) return;
    this.publish({
      type: NodeEventType.UpdateChildren,
    });
  }
}
