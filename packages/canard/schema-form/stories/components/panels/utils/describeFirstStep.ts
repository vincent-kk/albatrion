import { isArray } from '@winglet/common-utils/filter';

import { describeStep } from './describeStep';

/**
 * Find the first operation through nested batches, skipping observation-only records.
 * @param steps - Authored operations or observation-only records in execution order.
 * @returns The first non-batch operation, or undefined when there is none.
 */
function findFirstOperation(steps: readonly object[]): Record<string, unknown> | undefined {
  for (const step of steps) {
    const record = step as Record<string, unknown>;
    if (record.action === 'batch') {
      const nested = isArray(record.steps) ? findFirstOperation(record.steps) : undefined;
      if (nested) return nested;
    } else if (record.action) return record;
  }
  return undefined;
}

/**
 * Describe the first authored operation without changing the scenario data.
 * @param steps - Shared scenario operations in their authored order.
 * @returns One instruction; a root-level first operation or an unsupported one invites manual field editing.
 */
export function describeFirstStep(steps: readonly object[]): string {
  const first = findFirstOperation(steps);
  // A root write has no matching control, and later steps act on fields it creates, so it falls back.
  const phrase = first && first.path !== '' ? describeStep(first) : undefined;
  return phrase ? `${phrase}, then watch Value and Errors.` : 'Edit the fields and watch Value and Errors.';
}
