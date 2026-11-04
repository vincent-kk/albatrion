import { toDisplayJSON } from '../toDisplayJSON';

/**
 * Describe the first authored operation without changing the scenario data.
 * @param steps - Shared scenario operations in their authored order.
 * @returns One instruction; unsupported operations invite manual field editing.
 */
export function describeFirstStep(steps: readonly object[]): string {
  const step = steps[0] as Record<string, unknown> | undefined;
  const follow = ', then watch Value and Errors.';
  const path = typeof step?.path === 'string' ? step.path || 'the form' : undefined;
  switch (step?.action) {
    case 'setValue':
      if (path && 'value' in step) return `Set ${path} to ${toDisplayJSON(step.value, 0)}${follow}`;
      break;
    case 'clear':
      if (path) return `Clear ${path}${follow}`;
      break;
    case 'submit': return `Submit the form${follow}`;
    case 'reset': return `Reset the form${follow}`;
  }
  return 'Edit the fields and watch Value and Errors.';
}
