import type { FormErrorRecord } from '../../../errors';
import type { SchemaNodeRuntime } from '../type';

/**
 * Index a warning at every data-path ancestor, or forget its current identity.
 * @param runtime - Tree owning warning keys, records, and the optional path index
 * @param key - Structured warning identity, unchanged for schema-only warnings
 * @param path - Data occurrence path; absent for schema/form-level warnings
 * @param record - Pending occurrence to retain without changing its historical path
 * @param remove - Delete the key from both stores and every ancestor index
 * @returns Nothing; costs O(path depth), allocating only for indexed warnings
 */
export const indexSchemaNodeWarning = <Self>(
  runtime: SchemaNodeRuntime<Self>, key: string, path?: string,
  record?: FormErrorRecord, remove = false,
): void => {
  if (remove) {
    runtime.warningKeys?.delete(key);
    runtime.pendingWarningRecords?.delete(key);
  } else if (record) (runtime.pendingWarningRecords ??= new Map()).set(key, record);
  if (path === undefined) return;
  const index = remove ? runtime.warningKeysByPath :
    runtime.warningKeysByPath ??= new Map();
  if (!index) return;
  let ancestor = path;
  while (true) {
    if (remove) {
      const keys = index.get(ancestor);
      keys?.delete(key);
      if (keys?.size === 0) index.delete(ancestor);
    } else {
      let keys = index.get(ancestor);
      if (!keys) index.set(ancestor, keys = new Set());
      keys.add(key);
    }
    if (!ancestor) break;
    ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
  }
};
