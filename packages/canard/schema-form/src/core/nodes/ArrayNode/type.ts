import {
  BIT_FLAG_01,
  BIT_FLAG_02,
  BIT_FLAG_03,
  BIT_FLAG_04,
  BIT_MASK_NONE,
} from '@/schema-form/app/constants/binary';

export const enum OperationType {
  Idle = BIT_MASK_NONE,
  Push = BIT_FLAG_01,
  Update = BIT_FLAG_02,
  Remove = BIT_FLAG_03,
  Clear = BIT_FLAG_04,
}
