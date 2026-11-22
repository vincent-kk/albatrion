import { BIT_FLAG_18, BIT_FLAG_19 } from './bitmask';

/** Binding-only query for value revisions excluding a whole-branch input's own writes. */
export const EXTERNAL_VALUE_REVISION: number = BIT_FLAG_18;

/** Internal own-input counter bit; never emitted as a public event. */
export const INPUT_VALUE_REVISION: number = BIT_FLAG_19;
