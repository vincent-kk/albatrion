import { isArray } from '@winglet/common-utils/filter';

import { indexFieldNodeWarning } from '../../../record';
import type { FieldNodeRuntime } from '../../../record';

/**
 * Start a new form warning lifetime while retaining undelivered occurrences.
 * @param runtime - Tree whose form-level load clears reported warning identities
 * @returns Nothing; pending data warnings keep their current-key path index
 * @remarks O(pending warnings × path depth), only at form-level loads.
 */
export const clearWarningKeys = <Self>(
  runtime: FieldNodeRuntime<Self>,
): void => {
  runtime.warningKeys?.clear();
  runtime.warningKeysByPath?.clear();
  for (const [key, record] of runtime.pendingWarningRecords ?? []) {
    if (record.path === undefined) continue;
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[1] === 'string')
      indexFieldNodeWarning(runtime, key, parts[1]);
  }
};
