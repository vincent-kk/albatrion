import {
  type FieldNode,
  isFieldNodeValidationPending,
} from '@/schema-form/core';

import { advanceValidationFrame } from './advanceValidationFrame';

/** Await write-pending validation, including writes triggered by a delivered verdict.
 * An asynchronous mount verdict does not set write-pending: await its onValidate/error or explicit completion promise separately.
 * @param current - Root or resolver retaining the current root across replacements/unmounts.
 * @returns Completion when the current write verdict is no longer pending.
 * @throws When a validator or write cascade does not settle within the bounded rounds. */
export const settleValidation = async (
  current: FieldNode | (() => FieldNode | null | undefined),
): Promise<void> => {
  for (let round = 0; round < 64; round++) {
    await advanceValidationFrame();
    const root = typeof current === 'function' ? current() : current;
    if (!root || !isFieldNodeValidationPending(root)) return;
  }
  throw new Error(
    'Write-triggered validation did not settle within 64 frame rounds',
  );
};
