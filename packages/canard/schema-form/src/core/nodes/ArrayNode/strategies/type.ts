import type { ArrayValue } from '@/schema-form/types';

import type { SchemaNode, UnionSetValueOption } from '../../type';

/**
 * ArrayNode의 데이터와 작업을 관리하는 전략 인터페이스.
 * 배열 타입의 JSON 스키마에 대한 다양한 구현을 제공합니다.
 */
export interface ArrayNodeStrategy {
  /**
   * 배열의 현재 값을 가져옵니다.
   * @returns 배열 노드의 현재 값 또는 undefined
   */
  get value(): ArrayValue | undefined;
  /**
   * 배열의 현재 길이를 가져옵니다.
   * @returns 배열의 길이
   */
  get length(): number;
  /**
   * 자식 노드 목록을 가져옵니다.
   * @returns ID와 노드 정보를 포함한 배열
   */
  get children(): { id: string; node: SchemaNode }[] | null;
  /**
   * 입력값을 배열 노드에 적용합니다.
   * @param value - 설정할 배열 값
   * @param option - 설정 옵션
   */
  applyValue(
    this: this,
    value: ArrayValue | undefined,
    option: UnionSetValueOption,
  ): void;
  /**
   * 배열에 새 요소를 추가합니다.
   * @param data - 추가할 값 (생략 가능)
   */
  push(data?: ArrayValue[number]): void;
  /**
   * 특정 요소의 값을 업데이트합니다.
   * @param id - 업데이트할 요소의 ID 또는 인덱스
   * @param data - 새로운 값
   */
  update(id: IndexId | number, data: ArrayValue[number]): void;
  /**
   * 특정 요소를 삭제합니다.
   * @param id - 삭제할 요소의 ID 또는 인덱스
   */
  remove(id: IndexId | number): void;
  /** 모든 요소를 삭제하여 배열을 초기화합니다. */
  clear(): void;
  /** 하위 노드에 대해 pub-sub 링크를 활성화합니다. */
  activate?(): void;
}

export type IndexId = `[${number}]`;
