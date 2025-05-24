import type { ObjectValue } from '@/schema-form/types';

import type { UnionSetValueOption } from '../../type';
import type { ChildNode } from '../type';

/**
 * ObjectNode의 데이터와 작업을 관리하는 전략 인터페이스.
 * 객체 타입의 JSON 스키마에 대한 다양한 구현을 제공합니다.
 */
export interface ObjectNodeStrategy {
  /**
   * 객체의 현재 값을 가져옵니다.
   * @returns 객체 노드의 현재 값 또는 undefined
   */
  get value(): ObjectValue | undefined;
  /**
   * 자식 노드 목록을 가져옵니다.
   * @returns 자식 노드 배열
   */
  get children(): Array<ChildNode> | null;
  /**
   * 입력값을 객체 노드에 적용합니다.
   * @param value - 설정할 객체 값
   * @param option - 설정 옵션
   */
  applyValue(
    this: this,
    value: ObjectValue | undefined,
    option: UnionSetValueOption,
  ): void;
  /** 하위 노드에 대해 pub-sub 링크를 활성화합니다. */
  activate?(): void;
}
