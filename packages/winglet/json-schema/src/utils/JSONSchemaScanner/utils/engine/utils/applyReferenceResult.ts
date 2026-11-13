import type { UnknownSchema } from '@/json-schema/types/jsonSchema';

import { cloneSchema } from '../../output/cloneSchema';
import type { EngineEntry, ScanConfig } from '../type';

/**
 * Apply one resolver result to its frame, preserving truthy-target and clone/cache semantics.
 * @param entry Current entry to update, shared with enter and exit.
 * @param reference Written reference string whose result is being applied.
 * @param result Synchronous or already-awaited resolver result.
 * @param config Callback snapshot and output ledger receiving the inline operation.
 * @param active Active reference strings updated until this frame exits.
 * @param cache Optional per-scan memo table, including unresolved results.
 * @returns Whether traversal should descend into the resulting schema.
 */
export function applyReferenceResult<Schema extends UnknownSchema, ContextType>(
  entry: EngineEntry<Schema>,
  reference: string,
  result: unknown,
  config: ScanConfig<Schema, ContextType>,
  active: Set<string>,
  cache: Map<string, UnknownSchema | undefined> | undefined,
): boolean {
  const resolved = result as UnknownSchema | undefined;
  if (cache !== undefined) cache.set(reference, resolved);
  if (!resolved) {
    entry.hasReference = true;
    entry.referenceSkipped = 'unresolved';
    return false;
  }
  const inlined = config.cloneResolvedSchema ? cloneSchema(resolved) : resolved;
  config.operations.push({
    kind: 'replace',
    path: entry.path,
    value: inlined,
    copy: false,
  });
  entry.schema = inlined as Schema;
  entry.referencePath = reference;
  entry.referenceResolved = true;
  active.add(reference);
  return true;
}
