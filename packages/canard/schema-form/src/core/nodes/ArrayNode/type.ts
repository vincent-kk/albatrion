import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_MASK_NONE,
} from '@winglet/common-utils';

/**
 * 배열 노드의 작업 타입을 정의합니다.
 */
export const enum OperationType {
  Idle = BIT_MASK_NONE,
  Push = BIT_FLAG_00,
  Update = BIT_FLAG_01,
  Remove = BIT_FLAG_02,
  Clear = BIT_FLAG_03,
}
