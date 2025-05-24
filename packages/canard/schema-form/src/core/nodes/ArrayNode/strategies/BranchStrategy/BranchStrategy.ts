import { isArray } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';
import type { ArrayNode } from '@/schema-form/core/nodes/ArrayNode';
import {
  NodeEventType,
  type SchemaNode,
  type SchemaNodeFactory,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { AllowedValue, ArrayValue } from '@/schema-form/types';

import type { ArrayNodeStrategy } from '../type';

type IndexId = `[${number}]`;

export class BranchStrategy implements ArrayNodeStrategy {
  private __host__: ArrayNode;
  private __handleChange__: Fn<[ArrayValue | undefined]>;
  private __handleRefresh__: Fn<[ArrayValue | undefined]>;
  private __nodeFactory__: SchemaNodeFactory;

  private __locked__: boolean = true;
  private __dirty__: boolean = true;
  private __undefined__: boolean = false;

  private set __changed__(input: boolean) {
    this.__dirty__ = input;
    if (this.__undefined__) this.__undefined__ = false;
  }

  private __seq__: number = 0;
  private __ids__: IndexId[] = [];
  private __sourceMap__: Map<
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
  public get value() {
    if (this.__undefined__) return undefined;
    return this.__toArray__();
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  public applyValue(input: ArrayValue, option: UnionSetValueOption) {
    if (input === undefined) {
      this.clear();
      this.__undefined__ = true;
      this.__publishRequestEmitChange__(option);
    } else if (isArray(input)) {
      this.__locked__ = true;
      this.clear();
      for (const value of input) this.push(value);
      this.__locked__ = false;
      this.__publishRequestEmitChange__(option);
    }
  }

  /**
   * 배열 노드의 자식 노드들을 가져옵니다.
   * @returns 자식 노드 목록
   */
  public get children() {
    return this.__edges__;
  }

  /**
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이
   */
  public get length() {
    return this.__ids__.length;
  }

  /**
   * 모든 자식 노드에게 활성화를 전파합니다.
   * @internal 내부 구현용 메서드입니다. 직접 호출하지 마세요.
   */
  public activate() {
    for (const id of this.__ids__)
      (this.__sourceMap__.get(id)?.node as AbstractNode).activate(
        this.__host__,
      );
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
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;
    this.__nodeFactory__ = nodeFactory;

    // NOTE: defaultValue가 배열이고, 배열의 길이가 0보다 큰 경우
    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);

    while (this.length < (host.jsonSchema.minItems || 0)) this.push();

    host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange)
        this.__emitChange__(payload?.[NodeEventType.RequestEmitChange]);
    });

    this.__locked__ = false;

    this.__emitChange__();
    handleSetDefaultValue(this.value);
    this.__publishUpdateChildren__();
  }

  /**
   * 배열에 새 요소를 추가합니다.
   * @param data - 추가할 값 (생략 가능)
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public push(data?: ArrayValue[number]) {
    if (
      this.__host__.jsonSchema.maxItems &&
      this.__host__.jsonSchema.maxItems <= this.length
    )
      return;

    const id = ('[' + this.__seq__++ + ']') as IndexId;
    const name = this.__ids__.length.toString();
    this.__ids__.push(id);

    const defaultValue =
      data !== undefined
        ? data
        : getDefaultValue(this.__host__.jsonSchema.items);
    const childNode = this.__nodeFactory__({
      key: id,
      name,
      jsonSchema: this.__host__.jsonSchema.items,
      parentNode: this.__host__,
      defaultValue,
      onChange: this.__handleChangeFactory__(id),
      nodeFactory: this.__nodeFactory__,
    });
    this.__sourceMap__.set(id, {
      node: childNode,
      data: childNode.value,
    });

    if (this.__host__.activated)
      (childNode as AbstractNode).activate(this.__host__);

    this.__changed__ = true;
    this.__publishRequestEmitChange__();
    this.__publishUpdateChildren__();
  }

  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public update(id: IndexId | number, data: ArrayValue[number]) {
    const targetId = typeof id === 'number' ? this.__ids__[id] : id;
    this.__sourceMap__.get(targetId)?.node.setValue(data);
  }

  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   * @returns 자기 자신(this)을 반환하여 체이닝 지원
   */
  public remove(id: IndexId | number) {
    const targetId = typeof id === 'number' ? this.__ids__[id] : id;

    this.__ids__ = this.__ids__.filter((id) => id !== targetId);
    this.__sourceMap__.delete(targetId);
    this.__updateChildName__();

    this.__changed__ = true;
    this.__publishRequestEmitChange__();
    this.__publishUpdateChildren__();
  }

  /** 모든 요소를 삭제하여 배열을 초기화합니다. */
  public clear() {
    for (let i = 0; i < this.__ids__.length; i++)
      this.__sourceMap__.get(this.__ids__[i])?.node.cleanUp(this.__host__);

    this.__ids__ = [];
    this.__sourceMap__.clear();

    this.__changed__ = true;
    this.__publishRequestEmitChange__();
    this.__publishUpdateChildren__();
  }

  /**
   * 값 변경 이벤트를 발생시킵니다.
   * @param option - 옵션 설정 (기본값: SetValueOption.Default)
   * @private
   */
  private __emitChange__(option: UnionSetValueOption = SetValueOption.Default) {
    if (this.__locked__ || !this.__dirty__) return;
    const value = this.value;
    if (option & SetValueOption.EmitChange) this.__handleChange__(value);
    if (option & SetValueOption.Propagate) this.__publishUpdateChildren__();
    if (option & SetValueOption.Refresh) this.__handleRefresh__(value);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: value },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: undefined,
            current: value,
          },
        },
      });
    this.__dirty__ = false;
  }

  /**
   * 자식 노드들의 정보를 가져옵니다.
   * @returns ID와 노드 정보를 포함한 배열
   * @private
   */
  private get __edges__() {
    const edges = new Array<{ id: IndexId; node: SchemaNode }>(
      this.__ids__.length,
    );
    for (let i = 0; i < this.__ids__.length; i++) {
      const id = this.__ids__[i];
      edges[i] = {
        id,
        node: this.__sourceMap__.get(id)!.node,
      };
    }
    return edges;
  }
  /**
   * 내부 배열 상태를 객체 배열로 변환합니다.
   * @returns 배열의 값들을 포함한 배열
   * @private
   */
  private __toArray__() {
    const values = new Array<AllowedValue>(this.__ids__.length);
    for (let i = 0; i < this.__ids__.length; i++) {
      const edge = this.__sourceMap__.get(this.__ids__[i]);
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
  private __handleChangeFactory__(id: IndexId) {
    return (data: unknown) => {
      if (!this.__sourceMap__.has(id)) return;
      this.__sourceMap__.get(id)!.data = data;
      this.__changed__ = true;
      this.__publishRequestEmitChange__();
    };
  }

  /**
   * 배열 요소의 이름을 갱신합니다.
   * @private
   */
  private __updateChildName__() {
    for (let index = 0; index < this.__ids__.length; index++) {
      const id = this.__ids__[index];
      if (this.__sourceMap__.has(id)) {
        const node = this.__sourceMap__.get(id)!.node;
        const name = index.toString();
        if (node.name !== name) node.setName(name, this.__host__);
      }
    }
  }

  /**
   * 자식 노드 갱신 이벤트를 발행합니다.
   * @private
   */
  private __publishUpdateChildren__() {
    if (this.__locked__) return;
    this.__host__.publish({ type: NodeEventType.UpdateChildren });
  }

  /**
   * 값 변경 요청 이벤트를 발행합니다.
   * @param option - 변경 옵션 (선택 사항)
   * @private
   */
  private __publishRequestEmitChange__(option?: UnionSetValueOption) {
    if (this.__locked__) return;
    this.__host__.publish({
      type: NodeEventType.RequestEmitChange,
      payload: { [NodeEventType.RequestEmitChange]: option },
    });
  }
}
