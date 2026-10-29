import { isArray } from '@winglet/common-utils/filter';

import type { Dictionary } from '@aileron/declare';

/** Whether a value can merge by named keys without changing the host kind. */
export const isPlain = (value: unknown): value is Dictionary<unknown> =>
  value !== null && typeof value === 'object' && !isArray(value);
