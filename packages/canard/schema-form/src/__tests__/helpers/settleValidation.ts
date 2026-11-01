import type { FieldNode } from '@/schema-form/core';

import { advanceValidationFrame } from './advanceValidationFrame';
import { readFieldNodeRuntime } from './readFieldNodeRuntime';

/** Await write validation and eligibility-history releases, including verdict-triggered writes.
 * Load verdicts, including reset, run in the load slot. An asynchronous load verdict does not set write-pending: await its onValidate/error or explicit completion promise separately.
 * @param current - Root or resolver retaining the current root across replacements/unmounts.
 * @returns Completion when no write verdict or unreleased eligibility history remains.
 * @throws When a validator or write cascade does not settle within the bounded rounds. */
export const settleValidation = async (
  current: FieldNode | (() => FieldNode | null | undefined),
): Promise<void> => {
  for (let round = 0; round < 64; round++) {
    await advanceValidationFrame();
    const root = typeof current === 'function' ? current() : current;
    if (!root) return;
    const runtime = readFieldNodeRuntime(root);
    if (
      !runtime.validationPending &&
      !runtime.revealBaselineNodes?.size &&
      !runtime.revealPolicy?.entries.length
    )
      return;
  }
  throw new Error(
    'Write-triggered validation did not settle within 64 frame rounds',
  );
};
