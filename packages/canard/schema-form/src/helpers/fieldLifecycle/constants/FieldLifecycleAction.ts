import {
  BIT_FLAG_00,
  BIT_FLAG_01,
  BIT_MASK_NONE,
} from '@/schema-form/constants/bitmask';

/** Closed action flags executed by the input position after its queue completes. */
export enum FieldLifecycleAction {
  /** Observe the event without changing the input DOM. */
  None = BIT_MASK_NONE,
  /** Focus the first marked target or native control in the input container. */
  Focus = BIT_FLAG_00,
  /** Select text in the first input or textarea in the container. */
  Select = BIT_FLAG_01,
}
