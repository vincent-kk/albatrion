import { isArray } from '@winglet/common-utils/filter';

import { toDisplayJSON } from '../toDisplayJSON';

/**
 * Find the first operation through nested batches, leaving observations untouched.
 * @param steps - Authored operations or observation-only records in execution order.
 * @returns The first non-batch operation, or undefined when no operation exists.
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
 * @returns One instruction; unsupported operations invite manual field editing.
 */
export function describeFirstStep(steps: readonly object[]): string {
  const step = findFirstOperation(steps);
  const follow = ', then watch Value and Errors.';
  const path = typeof step?.path === 'string' ? step.path || 'the form' : undefined;
  switch (step?.action) {
    case 'setValue':
      if (path && 'value' in step) return `Set ${path} to ${toDisplayJSON(step.value, 0)}${follow}`;
      break;
    case 'clear':
      if (path) return `Clear ${path}${follow}`;
      break;
    case 'push':
      if (path) return `Add ${'value' in step ? toDisplayJSON(step.value, 0) : 'an item'} to ${path}${follow}`;
      break;
    case 'pop':
      if (path) return `Remove the last item from ${path}${follow}`;
      break;
    case 'remove':
      if (path && typeof step.index === 'number') return `Remove item ${step.index + 1} from ${path}${follow}`;
      break;
    case 'update':
      if (path && typeof step.index === 'number' && 'value' in step) return `Set item ${step.index + 1} in ${path} to ${toDisplayJSON(step.value, 0)}${follow}`;
      break;
    case 'resetSubtree':
      if (path) return `Reset ${path}${follow}`;
      break;
    case 'submit': return `Submit the form${follow}`;
    case 'reset': return `Reset the form${follow}`;
  }
  return 'Edit the fields and watch Value and Errors.';
}
