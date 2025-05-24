import { equals } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import type { ArrayNode } from '@/schema-form/core/nodes/ArrayNode';
import {
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseArray } from '@/schema-form/core/parsers';
import { getObjectDefaultValue } from '@/schema-form/helpers/defaultValue';
import type { AllowedValue, ArrayValue } from '@/schema-form/types';

import type { ArrayNodeStrategy, IndexId } from '../type';

const FIRST_EMIT_CHANGE_OPTION =
  SetValueOption.Replace | SetValueOption.Default;
export class TerminalStrategy implements ArrayNodeStrategy {
  private __host__: ArrayNode;
  private __handleChange__: Fn<[ArrayValue | undefined]>;
  private __handleRefresh__: Fn<[ArrayValue | undefined]>;

  private __locked__: boolean = true;
  private __seq__: number = 0;
  private __ids__: IndexId[] = [];
  private __defaultItemValue__: AllowedValue;

  private __value__: ArrayValue | undefined = [];

  /**
   * 배열의 현재 값을 가져옵니다.
   * @returns 배열 노드의 현재 값 또는 undefined
   */
  public get value() {
    return this.__value__;
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  public applyValue(input: ArrayValue, option: UnionSetValueOption) {
    this.__emitChange__(input, option);
  }

  /**
   * 자식 노드 목록을 가져옵니다.
   * @returns 빈 배열 (Terminal 전략은 자식 노드를 관리하지 않음)
   */
  public get children() {
    return null;
  }

  /**
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이 (값이 undefined인 경우 0)
   */
  public get length() {
    return this.__value__?.length ?? 0;
  }

  /**
   * TerminalStrategy 객체를 초기화합니다.
   * @param host - 호스트 ArrayNode 객체
   * @param handleChange - 값 변경 핸들러
   * @param handleRefresh - 새로고침 핸들러
   * @param handleSetDefaultValue - 기본값 설정 핸들러
   */
  constructor(
    host: ArrayNode,
    handleChange: Fn<[ArrayValue | undefined]>,
    handleRefresh: Fn<[ArrayValue | undefined]>,
    handleSetDefaultValue: Fn<[ArrayValue | undefined]>,
  ) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__handleRefresh__ = handleRefresh;

    const jsonSchema = host.jsonSchema;

    this.__defaultItemValue__ =
      jsonSchema.items.type === 'object'
        ? getObjectDefaultValue(jsonSchema.items)
        : jsonSchema.items.default;

    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);
    while (this.length < (jsonSchema.minItems || 0)) this.push();

    this.__locked__ = false;

    this.__emitChange__(this.__value__, FIRST_EMIT_CHANGE_OPTION);
    handleSetDefaultValue(this.__value__);
  }

  /**
   * 배열에 새 요소를 추가합니다.
   * @param input - 추가할 값 (생략 가능)
   */
  public push(input?: ArrayValue[number]) {
    if (
      this.__host__.jsonSchema.maxItems &&
      this.__host__.jsonSchema.maxItems <= this.length
    )
      return;
    const id = ('[' + this.__seq__++ + ']') as IndexId;
    this.__ids__.push(id);

    const data = input ?? this.__defaultItemValue__;
    const value =
      this.__value__ === undefined ? [data] : [...this.__value__, data];
    this.__emitChange__(value);
  }

  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   */
  public update(id: IndexId | number, data: ArrayValue[number]) {
    if (this.__value__ === undefined) return;
    const index = typeof id === 'number' ? id : this.__ids__.indexOf(id);
    if (index === -1 || index >= this.__value__.length) return;
    const value = [...this.__value__];
    value[index] = data;
    this.__emitChange__(value);
  }

  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   */
  public remove(id: IndexId | number) {
    if (this.__value__ === undefined) return;
    const index = typeof id === 'number' ? id : this.__ids__.indexOf(id);
    if (index === -1 || index >= this.__value__.length) return;
    const value = this.__value__.filter((_, i) => i !== index);
    this.__emitChange__(value);
  }

  /** 모든 요소를 삭제하여 배열을 초기화합니다. */
  public clear() {
    this.__ids__ = [];
    this.__emitChange__([]);
  }

  /**
   * 값 변경 이벤트를 발생시킵니다.
   * @param input - 새로운 배열 값
   * @param option - 옵션 설정 (기본값: SetValueOption.Default)
   * @private
   */
  private __emitChange__(
    input: ArrayValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.__value__;
    const current = this.__parseValue__(input);
    const replace = option & SetValueOption.Replace;

    if (!replace && equals(previous, current)) return;

    this.__value__ = current;

    if (this.__locked__) return;
    if (option & SetValueOption.EmitChange) this.__handleChange__(current);
    if (option & SetValueOption.Refresh) this.__handleRefresh__(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.__host__.publish({
        type: NodeEventType.UpdateValue,
        payload: { [NodeEventType.UpdateValue]: current },
        options: {
          [NodeEventType.UpdateValue]: {
            previous,
            current,
          },
        },
      });
  }

  /**
   * 입력 값을 적절한 배열 형식으로 파싱합니다.
   * @param input - 파싱할 값
   * @returns 파싱된 배열 값 또는 undefined
   * @private
   */
  private __parseValue__(input: ArrayValue | undefined) {
    return parseArray(input);
  }
}
