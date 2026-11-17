import { isArray } from '@winglet/common-utils/filter';

import { toDisplayJSON } from '../toDisplayJSON';

/**
 * Normalize array slots to the JSON values shown by the form's Value panel.
 * @param value - An authored value; array slots may contain undefined or holes.
 * @returns A copied array with null slots, or the original non-array value.
 */
function toStepValue(value: unknown): unknown {
  return isArray(value) ? Array.from(value, (item) => item === undefined ? null : toStepValue(item)) : value;
}

/**
 * Describe one authored scenario operation as an imperative sentence fragment.
 * @param step - An operation record from shared scenario steps; observation-only records have no action.
 * @returns A phrase without a final period, such as `Set /age to 15`; the root path reads as
 * "the whole value". Undefined for observation-only records, including an empty batch, unknown
 * actions or missing fields.
 */
export function describeStep(step: object): string | undefined {
  const record = step as Record<string, unknown>;
  const target = typeof record.path === 'string' ? record.path || 'the whole value' : undefined;
  const value = 'value' in record ? toDisplayJSON(toStepValue(record.value), 0) : undefined;
  const item = typeof record.index === 'number' ? record.index + 1 : undefined;
  switch (record.action) {
    case 'setValue': return target && value ? `Set ${target} to ${value}` : undefined;
    case 'clear': return target && `Clear ${target}`;
    case 'push': return target && `Add ${value ?? 'an item'} to ${target}`;
    case 'pop': return target && `Remove the last item from ${target}`;
    case 'remove': return target && item ? `Remove item ${item} from ${target}` : undefined;
    case 'update': return target && item && value ? `Set item ${item} in ${target} to ${value}` : undefined;
    case 'resetSubtree': return target && `Reset ${target}`;
    case 'submit': return 'Submit the form';
    case 'reset': return record.automaticWrites === 'disabled' ? 'Reset the form without automatic writes' : 'Reset the form';
    case 'batch': {
      const count = isArray(record.steps) ? record.steps.length : 0;
      return count ? `Run ${count} ${count === 1 ? 'operation' : 'operations'} in one batch` : undefined;
    }
    default: return undefined;
  }
}
