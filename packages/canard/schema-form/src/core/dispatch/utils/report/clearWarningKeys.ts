import { isArray } from '@winglet/common-utils/filter';

import { indexSchemaNodeWarning } from '../../../record';
import type { SchemaNodeRuntime } from '../../../record';

/**
 * Start a new form warning lifetime while retaining undelivered occurrences.
 * @param runtime - Tree whose form-level load clears reported warning identities
 * @returns Nothing; pending data warnings keep their current-key path index
 * @remarks O(pending warnings × path depth), only at form-level loads.
 */
export const clearWarningKeys = <Self>(runtime: SchemaNodeRuntime<Self>): void => {
  runtime.warningKeys?.clear();
  runtime.warningKeysByPath?.clear();
  for (const [key, record] of runtime.pendingWarningRecords ?? []) {
    if (record.path === undefined) continue;
    const parts: unknown = JSON.parse(key);
    if (isArray(parts) && typeof parts[1] === 'string')
      indexSchemaNodeWarning(runtime, key, parts[1]);
  }
};
