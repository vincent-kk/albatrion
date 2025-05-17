import { equals } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import {
  NodeEventType,
  SetValueOption,
  type UnionSetValueOption,
} from '@/schema-form/core/nodes/type';
import { parseArray } from '@/schema-form/core/parsers';
import type { ArrayValue } from '@/schema-form/types';

import type { ArrayNode } from '../../ArrayNode';
import type { ArrayNodeStrategy, IndexId } from '../type';

const FIRST_EMIT_CHANGE_OPTION =
  SetValueOption.Replace | SetValueOption.Default;
export class TerminalStrategy implements ArrayNodeStrategy {
  #host: ArrayNode;
  #handleChange: Fn<[ArrayValue | undefined]>;
  #handleRefresh: Fn<[ArrayValue | undefined]>;

  #locked: boolean = true;
  #seq: number = 0;
  #ids: IndexId[] = [];

  #value: ArrayValue | undefined = [];

  /**
   * 배열의 현재 값을 가져옵니다.
   * @returns 배열 노드의 현재 값 또는 undefined
   */
  get value() {
    return this.#value;
  }
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param input - 설정할 배열 값
   * @param option - 설정 옵션
   */
  applyValue(input: ArrayValue, option: UnionSetValueOption) {
    this.#emitChange(input, option);
  }

  /**
   * 자식 노드 목록을 가져옵니다.
   * @returns 빈 배열 (Terminal 전략은 자식 노드를 관리하지 않음)
   */
  get children() {
    return [];
  }

  /**
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이 (값이 undefined인 경우 0)
   */
  get length() {
    return this.#value?.length ?? 0;
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
    this.#host = host;
    this.#handleChange = handleChange;
    this.#handleRefresh = handleRefresh;

    if (host.defaultValue?.length)
      for (const value of host.defaultValue) this.push(value);
    while (this.length < (host.jsonSchema.minItems || 0)) this.push();

    this.#locked = false;

    this.#emitChange(this.#value, FIRST_EMIT_CHANGE_OPTION);
    handleSetDefaultValue(this.#value);
  }

  /**
   * 배열에 새 요소를 추가합니다.
   * @param input - 추가할 값 (생략 가능)
   */
  push(input?: ArrayValue[number]) {
    if (
      this.#host.jsonSchema.maxItems &&
      this.#host.jsonSchema.maxItems <= this.length
    )
      return;
    const id = `[${this.#seq++}]` satisfies IndexId;
    this.#ids.push(id);
    const data = input ?? this.#host.jsonSchema.items.default ?? undefined;
    const value = this.#value === undefined ? [data] : [...this.#value, data];
    this.#emitChange(value);
  }

  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   */
  update(id: IndexId | number, data: ArrayValue[number]) {
    if (this.#value === undefined) return;
    const index = typeof id === 'number' ? id : this.#ids.indexOf(id);
    if (index === -1 || index >= this.#value.length) return;
    const value = [...this.#value];
    value[index] = data;
    this.#emitChange(value);
  }

  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   */
  remove(id: IndexId | number) {
    if (this.#value === undefined) return;
    const index = typeof id === 'number' ? id : this.#ids.indexOf(id);
    if (index === -1 || index >= this.#value.length) return;
    const value = this.#value.filter((_, i) => i !== index);
    this.#emitChange(value);
  }

  /** 모든 요소를 삭제하여 배열을 초기화합니다. */
  clear() {
    this.#ids = [];
    this.#emitChange([]);
  }

  /**
   * 값 변경 이벤트를 발생시킵니다.
   * @param input - 새로운 배열 값
   * @param option - 옵션 설정 (기본값: SetValueOption.Default)
   * @private
   */
  #emitChange(
    input: ArrayValue | undefined,
    option: UnionSetValueOption = SetValueOption.Default,
  ) {
    const previous = this.#value;
    const current = this.#parseValue(input);
    const replace = option & SetValueOption.Replace;

    if (!replace && equals(previous, current)) return;

    this.#value = current;

    if (this.#locked) return;
    if (option & SetValueOption.EmitChange) this.#handleChange(current);
    if (option & SetValueOption.Refresh) this.#handleRefresh(current);
    if (option & SetValueOption.PublishUpdateEvent)
      this.#host.publish({
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
  #parseValue(input: ArrayValue | undefined) {
    if (input === undefined) return undefined;
    return parseArray(input);
  }
}
